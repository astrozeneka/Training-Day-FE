import { ChangeDetectorRef, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, filter, forkJoin, from, map, Subject, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContentService } from '../../../content.service';
import { FeedbackService } from '../../../feedback.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';
import { PurchaseService } from '../../../purchase.service';
import { Platform } from '@ionic/angular';
import { DarkModeService } from '../../../dark-mode.service';
import { AbstractPurchaseInvoicePage, AndroidStoreProduct } from '../abstract-purchase-invoice';
import StorePlugin, { AndroidProduct, Product, PromoOfferIOS, Transaction } from "../../../custom-plugins/store.plugin";
import { AndroidStoreProductUIAdapter } from '../android-store-product-ui-adapter';




export interface AndroidTransaction extends Transaction {
  purchase_token: string
}
@Component({
  selector: 'app-android-purchase-invoice',
  templateUrl: './android-purchase-invoice.page.html',
  styleUrls: ['./android-purchase-invoice.page.scss', '../purchase-invoice.scss'],
})
export class AndroidPurchaseInvoicePage extends AbstractPurchaseInvoicePage<AndroidStoreProduct> implements OnInit{

  // Don't use this anymore, use similar to the os (a formGroup)
  acceptConditions: FormControl = new FormControl(false);

  offerToken:string|undefined = undefined // Used for android subscriptions

  productType: 'inapp'|'subs'|'null' = null; // (only required for Android)

  // BehaviorSubject shouldn't be used here
  productDataBS: BehaviorSubject<{id: string, type: string}> = new BehaviorSubject(null)
  
  // Redeem code (to handle later)
  redeemCodeEnabled = environment.redeemCodeEnabled
  redeemCodeSheetPresented$:Subject<any> = new Subject() // Fired after the redeem code sheet is presented
  
  // Promotional offer (to handle later)

  os: string = 'android'

  // Observable to allow observable-friendly coding
  onPurchaseDone$: Subject <{purchases:AndroidProduct[]}> = new Subject()
  onPurchaseAborted$: Subject <any> = new Subject()

  // Additional fields (to be rearranged later)
  form: FormGroup = new FormGroup({
    'offer': new FormControl(null, [Validators.required]),
    'acceptCGV': new FormControl(false, [Validators.requiredTrue])
  })
  product = null

  processProgress = 0
  isOfferLoading: WritableSignal<boolean> = signal(true)

  uiAdapter?: AndroidStoreProductUIAdapter = null
  uiTheme: WritableSignal<'primary' | 'dark' | 'warning' | 'danger' | 'light'> = signal('primary');

  constructor(
      private cs: ContentService,
      private themeDetection: ThemeDetection,
      private purchaseService: PurchaseService,
      platform: Platform,
      router: Router,
      dms: DarkModeService,
      feedbackService: FeedbackService,
      private cdr: ChangeDetectorRef,
      private route: ActivatedRoute
  ) {
    super(platform, router, dms, feedbackService);
  }

  /**
   * Get the selectable offers array for Android
   * For Android, displayables map directly to product.offers
   */
  get selectableOffers(): any[] {
    if (!this.product || !this.product.offers) return []
    return this.product.offers
  }

  /**
   * Handle subscription selection from radio buttons
   */
  onSubscriptionChange(offer: any) {
    this.form.patchValue({ offer })
    this.cdr.detectChanges()
  }

  ngOnInit() {
    // 1. Load productId and offerToken to be used in the page
    /*forkJoin({
      productId: from(this.cs.storage.get('productId')),
      offerToken: from(this.cs.storage.get('offerToken'))
    })
      .pipe(
        tap(({productId, offerToken}) => {
          console.log("Load forked ", JSON.stringify({productId, offerToken}))
          this.productId = productId
          this.offerToken = offerToken
          this.productType = this.getProductType(productId)
        }),
        switchMap(() => {
          return from(this.purchaseService.getProducts(this.productType))
            .pipe(catchError((err)=>{
              console.error("Error while fetching product list ", JSON.stringify(err))
              return []
            }))
        })
      )
      .subscribe((data:{products:Product[]}) => {
        this.productList = data.products.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
      })*/
    this.isOfferLoading.set(true)
    forkJoin({
      productId: from(this.cs.storage.get('productId')),
      productList: from(this.purchaseService.getProducts('subs'))
    })
      .pipe(map(({productId, productList}) => {
        this.productList = productList.products.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
        this.productId = productId
        // Bad practice, need to review the below "as any as AndroidStoreProduct" later
        return productList.products.find((product) => product.id == productId) as any as AndroidStoreProduct
      }))
      .subscribe((product:AndroidStoreProduct) => {
        this.product = product
        console.log("---a>" + JSON.stringify(product))
        this.uiAdapter = (new AndroidStoreProductUIAdapter(product as AndroidStoreProduct))

        // Set theme based on product (need to refactor) todo later
        const themeMap: {[key: string]: 'primary' | 'dark' | 'warning' | 'danger' | 'light'} = {
          "hoylt": "dark",
          "gursky": "warning",
          "smiley": "danger",
          "alonzo": "primary"
        }
        this.uiTheme.set(themeMap[product.id] || 'primary')
        console.log("====", product.id, this.uiTheme())

        // Initialize form with the first offer selected
        if (this.selectableOffers.length > 0) {
          this.form.patchValue({ offer: this.selectableOffers[0] })
        }

        this.isOfferLoading.set(false)
        console.log("Loaded product: ", (product));
        console.log(this.productList, this.productId, this.productList[this.productId])
        this.cdr.detectChanges()
      })
    
    // 2. Listener that will be able to listen the onPurchase event and link to the related observable
    StorePlugin.addListener('onPurchase', (purchases: {purchases:AndroidProduct[]}) => {
      // Filter the router
      if (!this.router.url.includes('android-purchase-invoice'))  
        return
      // Transmit to observers
      this.onPurchaseDone$.next(purchases)
    })

    // 2.b. Listener that will be able to listen the onPurchaseAborted event
    StorePlugin.addListener('onPurchaseAborted', (data) => {
      // Filter the router
      if (!this.router.url.includes('android-purchase-invoice'))
        return
      // Transmit to observers
      this.onPurchaseAborted$.next(data)
    })

    // 3. The emulation mode (for testing only)
    /*if (!environment.production){
      StorePlugin.onEmulatedOS().subscribe((os) => {
        this.os = 'android'
      })
    }*/

    // 4. Check the productId, then load the set the productType accordingly
    from(this.cs.storage.get('productId'))
      .subscribe(productId=>{
        if (['hoylt', 'moreno', 'gursky', 'smiley', 'alonzo'].includes(productId)) {
          this.productType = 'subs'
        } else {
          this.productType = 'inapp'
        }
      })
  }

  continueToPayment(){
    if (!this.form.valid)
      return;

    this.isLoading.set(true)
    this.loadingStep.set("(1/3) Connexion à Google Play")

    // Specific to android, for subscription, the product id is "training_day" instead of hoylt, moreno, etc.
    let productId = this.productId
    if (this.productType == 'subs'){
      productId = 'training_day'
      this.offerToken = this.form.value.offer.androidOfferToken
    }
    //console.log(`Product id is ${productId}, productType is ${this.productType}`)
    //console.log(`Product JSON: ${JSON.stringify(this.form.value.offer)}`)

    // Launch the payment
    let purchaseObs = from(this.purchaseService.purchaseProductById(productId, this.productType, this.offerToken, 'android', null, null))
      .pipe(
        catchError((err)=>{
          console.error(`Error while purchasing product ${this.productId} : ${JSON.stringify(err)}`)
          return null
        })
      )

    // Handle abortion
    purchaseObs.pipe(
      switchMap(()=>this.onPurchaseAborted$.pipe(take(1)))
    )
      .subscribe((data)=>{
        console.log(`Purchase aborted ${JSON.stringify(data)}`)
        this.isLoading.set(false)
        this.loadingStep.set(null)
        this.cdr.detectChanges();
        this.feedbackService.registerNow("La transaction a été annulée", "danger")
      })
    
    // Handle success: save to backend
    let savePurchase$ = purchaseObs.pipe(
      switchMap(()=>this.onPurchaseDone$.pipe(take(1))),
      map((data)=>{
        if (data.purchases.length == 0){
          this.feedbackService.registerNow("Aucun achat effectué", "danger")
          return null
        }
        return data.purchases[0]
      }),
      switchMap((product)=>{
        console.log(`Handle purchase success: ${JSON.stringify(product)}`)
        this.loadingStep.set("(2/3) Enregistrement de l'achat")
        this.cdr.detectChanges();
        // Restored the patched product_id
        // In android, the product_id in the Google Play Store is training_day, contrary to App Store which uses hoylt, moreno, etc.
        (product as AndroidProduct).productId = this.productId;
        (product as any).purchaseTime = Math.round((product as any).purchaseTime / 1000)
        return this.cs.post('/payments/registerAndroidIAPTransaction', product)
          .pipe(catchError((err)=>{
            console.error(`Error while saving android purchase to server : ${JSON.stringify(err)}`)
            this.isLoading.set(false)
            this.loadingStep.set(null)
            return null
          }), tap(()=>{
            console.log("Correctly saved purchase to the server");
          }))
      }),
      filter((data)=>data!=null)
    )

    // Then, acknowledge the purchase
    savePurchase$
      .pipe(
        switchMap((data:AndroidTransaction)=>{
          this.loadingStep.set("(3/3) Validation de l'achat")
          this.cdr.detectChanges();
          console.log(`Purchase saved to the server : ${JSON.stringify(data)}`)
          return from(StorePlugin.acknowledgeAndroidPurchase({purchaseToken: data.purchase_token}))
            .pipe(catchError((err)=>{
              console.error(`Error while acknowledging purchase: ${JSON.stringify(err)}`)
              this.isLoading.set(false)
              this.loadingStep.set(null)
              return throwError(err)
            }))
        })
      )
    .subscribe(()=>{
      console.log("The purchase has been acknowledged")
      // Redirect with feedback
      this.redirectWithFeedback()
    })

  }

}
