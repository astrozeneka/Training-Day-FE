import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {ContentService} from "../../../content.service";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import StorePlugin, { AndroidProduct, Product, PromoOfferIOS, Transaction } from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";
import {FeedbackService} from "../../../feedback.service";
import {BehaviorSubject, catchError, combineLatest, distinctUntilChanged, distinctUntilKeyChanged, filter, finalize, merge, Observable, Subject, tap} from "rxjs";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';
import { PurchaseService } from 'src/app/purchase.service';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { PlatformType } from 'src/app/models/Interfaces';
import { DarkModeService } from 'src/app/dark-mode.service';
import StoredData from 'src/app/components-submodules/stored-data/StoredData';
import { add } from 'date-fns';

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.page.html',
  styleUrls: ['./purchase-invoice.page.scss'],
})
export class PurchaseInvoicePage implements OnInit {

  productList:any = {} // Bound to the Store
  productId:string|undefined = undefined
  offerToken:string|undefined = undefined // Used for subscriptions

  acceptConditions: FormControl = new FormControl(false);

  isLoading: boolean = false;
  loadingStep: string = null;

  // 2. Determine the product type depending on the productId whether inapp or subs
  // productId:string|undefined = undefined
  productType: 'inapp'|'subs'|'null' = null; // (only required for Android)
  productDataBS: BehaviorSubject<{id: string, type: string}> = new BehaviorSubject(null)

  // Redeem code
  redeemCodeEnabled = environment.redeemCodeEnabled
  redeemCodeSheetPresented$:Subject<any> = new Subject() // Fired after the redeem code sheet is presented

  // The platform
  os: PlatformType

  // Promotional offers
  promoOffers: PromoOfferIOS[] = []
  promoOffersAreLoading: boolean = false

  @ViewChild('swiperEl') swiperEl: ElementRef | null = null as any

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router,
    private themeDetection: ThemeDetection,
    private purchaseService: PurchaseService,
    private platform: Platform,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private dms: DarkModeService
  ) {
    //  Both 'productId' and 'offerToken' are both passed thorugh storage
    this.contentService.storage.get('productId').then((value) => {
      this.productId = value;
      if(this.productId.includes("foodcoach") || this.productId.includes("sportcoach") || this.productId.includes("trainer")){
        this.productType = 'inapp'
      }else{
        this.productType = 'subs'
      }
      this.productDataBS.next({id: this.productId, type: this.productType})
    });
    this.contentService.storage.get('offerToken').then((value)=> {
      console.log("Loading offer token from storag (offerToken):", value)
      this.offerToken = value
    })

    // 3. The emulation mode (for testing only)
    if (!environment.production){
      StorePlugin.onEmulatedOS().subscribe((os) => {
        this.os = os
      })
    } else {
      if (this.platform.is('android')){
        this.os = 'android'
      } else {
        this.os = 'ios'
      }
    }
  }

  async ngOnInit() {

    // 1. Load product from the store
    this.productDataBS.asObservable()
    .pipe(filter((productData) => productData !== null))  
    .subscribe(async (productData) => {
      console.log("Loading product for the store (productId, productType):", JSON.stringify(productData))
      let productList:Product[] = (await this.purchaseService.getProducts(this.productType)).products
      this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
    })

    // In the future, should find a common architecture that
    // both Android and iOS can use
    // 2. Listen for the purchase event (only on Android)
    if (this.os == 'android') {
      //this.purchaseService.addListener('onPurchase', (purchases:{purchases:AndroidProduct[]}) => {
      console.log("Registering listener for android")
      StorePlugin.addListener('onPurchase', (purchases:{purchases:AndroidProduct[]}) => {
        console.log("onPurchase fired " + JSON.stringify(purchases))
        // We expected that only one product has been purchased
        if(purchases.purchases.length > 0){
          this.purchaseCompleted(purchases.purchases[0])
          if (purchases.purchases.length > 1){
            purchases.purchases.slice(1).forEach((product) => {
              this.purchaseCompleted(product)
            })
          }
        }
      })
      // On Purchase abortion (android only)
      StorePlugin.addListener('onPurchaseAborted', (data)=>{
        console.log("onPurchaseAborted fired " + JSON.stringify(data))
        if (this.isLoading){
          this.isLoading = false
          this.loadingStep = null
          this.cdr.detectChanges()
          this.feedbackService.registerNow("Transaction annulée par l'utilisateur", "danger") // Not consistent with the IOS architecture
        }
      })
    }

    if (this.os == 'ios'){
      // Separated due to the experimental nature of the plugin
      let iosOnPurchase$ = new Subject<Transaction>()
      StorePlugin.addListener('onIOSPurchase', (purchases:{purchases:Transaction[]}) => {
        console.log("onIOSPurchase fired " + JSON.stringify(purchases))
        if (purchases.purchases.length > 0){
          let transaction = purchases.purchases[0];
          (transaction as any).currency = 'EUR'; // TODO, update to local currency (typing must be solved later)
          (transaction as any).amount = this.productList[this.productId as string].price * 100; // No need to apply patch for iOS
          (transaction as any).product_id = this.productId
          // this.purchaseCompleted(transaction) // Actually moved to the purchaseCompleted method
          iosOnPurchase$.next(transaction)
        }
      })
      
      combineLatest([
        this.redeemCodeSheetPresented$.pipe(tap((res) => console.log("REDEEMCODESHEETPRESENTED$: " + JSON.stringify(res)))),
        iosOnPurchase$.pipe(tap((res) => console.log("IOSONPURCHASE$: " + JSON.stringify(res))))
      ])
        .subscribe(([redeemCodeResult, transaction]) => {
          console.log("Combine redeemCodeResult and transaction")
          this.purchaseCompleted(transaction)
        })
    }

    // X. Load promotional offers (need to configure later)
    this.promoOffersAreLoading = true
    this.purchaseService.onPromoOfferIOS('hoylt', true, true)
      .pipe(
        distinctUntilKeyChanged('length'),
      )
      .subscribe((offers:PromoOfferIOS[]) => {
        this.promoOffers = offers
        this.promoOffersAreLoading = false
      })
  }

  async continueToPayment(){
    if(environment.paymentMethod == 'inAppPurchase'/* && this.platform.is('capacitor')*/){
      // Notes: testing components through the web is also important thing
      this.isLoading = true
      console.log(this.os)
      if (this.os == 'android'){
        this.loadingStep = "(1/2) Connexion à Google Play"
      } else if (this.os == 'ios') {
        this.loadingStep = "(1/2) Connexion à l'App Store"
      }
      // Confirm purchase
      //let res:any = (await StorePlugin.purchaseProductById({productId: this.productId!})) as any;
      console.log("Calling purchaseProductById, productId: " + this.productId + ", productType: " + this.productType)
      let productId = this.productId;
      if (this.productType == 'subs' && this.os == 'android') productId = 'training_day'; // Applying patch (only for android)
      
      let res:{success:any, transaction:any}
      try {
        res = (await this.purchaseService.purchaseProductById(productId!, this.productType!, this.offerToken, this.os)) as any;
        console.log("Purchase result: " + JSON.stringify(res), "info")
      } catch (e) {
        console.log("Error in purchaseProductById: " + JSON.stringify(e), "error")
        this.feedbackService.registerNow(e.message, "danger")
        this.isLoading = false
        this.loadingStep = null
      }
      // Android flow ends here
      if (this.os == 'ios'){
        // IMPORTANT: In iOS, the following data should added to the transaction (this code part should normally managed by the native code)
        // TODO later, put the code below inside the native code
        res.transaction.currency = 'EUR' // TODO, update to local currency
        res.transaction.amount = this.productList[this.productId as string].price * 100 // No need to apply patch for iOS
        res.transaction.product_id = this.productId
        this.purchaseCompleted(res.transaction)
      }
      // The android counterparts will use the plugin eveing listener
    }else{
      // Testing payment through the web is important
      // Dead code
      this.feedbackService.registerNow("The payment purchase is not availble", "danger")
    }
  }

  // A common platform to handle both iOS and Android purchases
  private purchaseCompleted(product: Product|AndroidProduct|Transaction){
    this.loadingStep = "(2/2) Enregistrement de l'achat"
    this.cdr.detectChanges()
    console.log("Processing purchase completed"); // WE ARE HERE
    let url = ""
    if (this.os == 'ios'){
      url = '/payments/registerIAPTransaction'
    }else if(this.os == 'android'){
      url = '/payments/registerAndroidIAPTransaction';
      // Patch the product_id (for android only)
      (product as AndroidProduct).productId = this.productId
    }
    (product as any).purchaseTime = Math.round((product as any).purchaseTime / 1000)
    this.contentService.post(url, product)
      .pipe(catchError(err => {
        console.error("StorePlugin error: " + JSON.stringify(err));
        this.feedbackService.registerNow("Erreur: " + err.error.message, "error")
        return err
      }), finalize(() => { this.isLoading = false }))
      .subscribe((response:any) => { // Typing should be
        console.log(response)
        console.log("Retrieve response after purchase")
        this.redirectWithFeedback()
      })
  }

  private async redirectWithFeedback(){
    // The code below is redundant, should be refactored
    let feedbackOpts = {
      type: 'modal',
      buttonText: null,
      primaryButtonText: (this.productId.includes('foodcoach') || this.productId.includes('smiley')) ? 'Prendre contact avec mon nutritionniste' : 'Prendre contact avec mon coach',
      secondaryButtonText: 'Retour à l\'accueil',
      primaryButtonAction: '/chat',
      secondaryButtonAction: '/home',
      modalImage: (await this.dms.isAvailableAndEnabled()) ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
    }
    if(["hoylt", "gursky", "moreno", "smiley", "alonzo"].includes(this.productId)){ // Auto-renewables
      this.feedbackService.register(
        null,
        'success',
        {
          modalTitle: "Votre achat d'abonnement a été effectué",
          modalContent: 'Bienvenue chez Training Day vous pouvez dès à présent prendre rendez-vous avez votre ' +
            (["smiley"].includes(this.productId) ? "nutritionniste" : "coach"),
          ...feedbackOpts
        }
      )
    } else{ // Non-renewables
      let content;
      if(this.productId.includes('foodcoach')){
        content = 'Votre nutritionniste prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre programme nutritionnel en fonction de vos attentes'
      }else if(this.productId.includes('sportcoach')){
        content = 'Votre coach prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre programme sportif en fonction de vos attentes'
      }else if(this.productId.includes('trainer')){
        content = 'Votre coach prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
          'de planifier votre entraînement en fonction de vos attentes'
      }
      this.feedbackService.register(
        null,
        'success',
        {
          modalTitle: 'Votre achat a été effectué',
          modalContent: content,
          ...feedbackOpts
        }
      )
    }
    this.router.navigate(['/home'])
  }

  protected readonly environment = environment;

  // 10. Open CGV
  openCGV(){
    let url = environment.rootEndpoint + environment.cgv_uri
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }

  // Redeem code sheet
  presentRedeemSheet(){
    if (this.os == 'ios'){
      this.isLoading = true
      this.loadingStep = "(1/2) Connexion à l'App Store"
      this.purchaseService.presentRedeemCodeSheet().then((res)=>{
        this.isLoading = false
        this.redeemCodeSheetPresented$.next(res)
      })
    } else if (this.os == 'android'){
      this.router.navigate(['/promo-code-android'])
    } else{
      this.feedbackService.registerNow("La fonctionnalité n'est pas disponible sur cette plateforme", "danger")
    }
  }

  testFetchPromotionalOffer(){
    // For hoylt
    StorePlugin.fetchPromotionalOffer({productId: "hoylt"}).then((res) => {
      console.log("fetchPromotionalOffer result: " + JSON.stringify(res))
    })
  }
}
