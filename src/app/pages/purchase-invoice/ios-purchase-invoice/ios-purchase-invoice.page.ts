import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, catchError, filter, finalize, forkJoin, from, Observable, of, Subject, switchMap, take, tap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { DarkModeService } from 'src/app/dark-mode.service';
import { FeedbackService } from 'src/app/feedback.service';
import { PurchaseService } from 'src/app/purchase.service';
import { AbstractPurchaseInvoicePage } from '../abstract-purchase-invoice';
import { Product, PromoOfferIOS, Transaction } from 'src/app/custom-plugins/store.plugin';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ios-purchase-invoice',
  templateUrl: './ios-purchase-invoice.page.html',
  styleUrls: ['./ios-purchase-invoice.page.scss', '../purchase-invoice.scss'],
})
export class IosPurchaseInvoicePage extends AbstractPurchaseInvoicePage implements OnInit {
  // The form
  form: FormGroup = new FormGroup({
    'offer': new FormControl(null, [Validators.required]),
    'acceptCGV': new FormControl(false, [Validators.requiredTrue])
  })

  // Improved UI while loading ui
  offersAreLoading: boolean = false

  // Loader to improve User Experience
  processProgress: number = 0

  // Offer signature loading observable
  offerSignatureLoadingSubject: BehaviorSubject<PromoOfferIOS[]> = new BehaviorSubject(null)
  offerSignatureLoading$: Observable<PromoOfferIOS[]> = this.offerSignatureLoadingSubject.asObservable()

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
    super(platform, router, dms, feedbackService)
  }

  ngOnInit() {

    // 1. Load products to be used (similar but a little bit simplified than the Android version)
    this.offersAreLoading = true
    from(this.cs.storage.get('productId'))
      .pipe(
        switchMap((productId)=>{
          this.productId = productId
          return from(this.purchaseService.getProducts())
            .pipe(catchError((err)=>{
              console.error("Error while fetching product list ", JSON.stringify(err))
              this.offersAreLoading = false
              this.cdr.detectChanges()
              return []
            }))
        }),
        switchMap((data:{products:Product[]}) => {
          this.productList = data.products.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
          this.offersAreLoading = false
          this.cdr.detectChanges()

          // 2. Load offer token for each of the loaded promotional offer
          let product = this.productList[this.productId]

          let observables = product.offers.map((offer) => 
            this.cs.getOne('/generate-offer-signature', { offer_identifier: offer.offerId, product_identifier: offer.productId })
              .pipe(
                catchError((err) => {
                  console.error(`Error getting offer signature for ${offer.offerId} : ${JSON.stringify(err)}`)
                  return throwError(()=>err)
                }),
                tap((res: any)=>{
                  console.log(`Retrieve offer signature for: ${offer.offerId} : ${JSON.stringify(res)}`)
                  offer.signatureInfo = res
                })
              )
          )
          return forkJoin(observables)
        })
      )
      .subscribe((res:PromoOfferIOS[]) => {
        console.log(`All offer signature are loaded: ${JSON.stringify(this.productList[this.productId].offers)}`)
        this.offerSignatureLoadingSubject.next(res)
      })

  }

  continueToPayment(){
    this.isLoading = true
    this.processProgress = 0.3
    this.loadingStep = "Connexion à l'App Store"

    let res: any
    if (this.form.value.offer.offerId){
      console.log(`Purchasing a promotional offer ${this.form.value.offer.offerId} : ${JSON.stringify(this.form.value.offer)}`)
      res = this.offerSignatureLoading$
        .pipe(
          filter((offers) => offers !== null),
          take(1),
          switchMap((offers) => {
            let offer = this.form.value.offer
            console.log(`Offer is: ${JSON.stringify(offer)}`)
            return from(this.purchaseService.purchaseProductById(this.form.value.offer.productId, null, null, 'ios', this.form.value.offer.offerId, offer.signatureInfo))
              .pipe(
                catchError((err)=>{
                  console.error(`Error while purchasing the offer ${offer.offerId} : ${JSON.stringify(err)}`)
                  this.feedbackService.registerNow(err.errorMessage, "dark")
                  return throwError(()=>err)
                }),
                finalize(()=>{
                  this.isLoading = false
                  this.loadingStep = null
                  this.processProgress = 0
                })
              )
          })
        )
      // res = from(this.purchaseService.purchaseProductById(this.form.value.offer.offerId, null, null, 'ios', null, null))
    } else{
      console.log(`Purchasing the base offer ${this.productId} : ${JSON.stringify(this.form.value.offer)}`)
      res = from(this.purchaseService.purchaseProductById(this.productId, null, null, 'ios', null, null))
        .pipe(
          catchError((err)=>{
            console.error(`Error while purchasing the base offer ${this.form.value.offer.productId} : ${JSON.stringify(err)}`)
            this.feedbackService.registerNow("La transaction a été annulée", "dark")
            this.isLoading = false
            this.loadingStep = null
            this.processProgress = 0
            return throwError(()=>err)
          })
        )
    }
    res.pipe(
      switchMap((res:{success:any, transaction:any})=>{
        console.log(`Here : ${JSON.stringify(res)}`)
        /**
         * Sample data: 
         */
        // Preprocess the receipt and run same as the purchaseCompleted from the old page
        res.transaction.currency = "_"
        res.transaction.amount = this.productList[this.productId as string].price * 100 // No need to apply patch for iOS
        res.transaction.product_id = this.productId
        res.transaction.purchaseTime = Math.round(res.transaction.purchaseTime) / 1000
  
        // Save the transaction
        this.processProgress = 0.6
        this.loadingStep = "Enregistrement de la transaction"
        this.cdr.detectChanges()
        return this.cs.post('/payments/registerIAPTransaction', res.transaction)
          .pipe(
            catchError((err)=>{
              console.error(`Error while registering the transaction: ${JSON.stringify(err)}`)
              this.feedbackService.registerNow("Erreur lors de l'enregistrement de la transaction", "danger")
              return throwError(()=>err)
            }),
            finalize(()=>{
              this.processProgress = 0
              this.loadingStep = null
              this.isLoading = false
            })
          )
      })
    )
    .subscribe(()=>{
      this.processProgress = 0
      this.isLoading = false
      this.loadingStep = null
      this.redirectWithFeedback()
    })
  }
}
