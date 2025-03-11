import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, catchError, combineLatest, filter, finalize, from, map, merge, Observable, Subject, switchMap, take, throwError } from 'rxjs';
import Store, { AndroidEntitlement, AndroidProduct } from 'src/app/custom-plugins/store.plugin';
import { FeedbackService } from 'src/app/feedback.service';
import { PurchaseService } from 'src/app/purchase.service';
import { App } from '@capacitor/app';
import { ContentService } from 'src/app/content.service';
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';


@Component({
  selector: 'app-promo-code-android',
  templateUrl: './promo-code-android.page.html',
  styleUrls: ['./promo-code-android.page.scss'],
})
export class PromoCodeAndroidPage implements OnInit {
  form = new FormGroup({
    promoCode: new FormControl('', [Validators.required]),
  });
  displayedError:{[key:string]:string|null} = {
    // unused
  }
  formIsLoading: boolean = false; // Unused for now

  // Experimental
  submitted$ = new Subject() // Fired after the form is submitted
  onResume$ = new Subject() // Fired when the user is back in the webview

  // The currently fetched entitlements (used to fetch the recently purchased one)
  currentEntitlement: AndroidEntitlement[] = []

  // To be deleted later
  itemList: AndroidEntitlement[] = []

  // Should be refactored in a base class (very low code quality)
  useDarkMode: boolean = true;

  // Product type
  productType: 'subs' | 'inapp' // The product type (subs or inapp)

  constructor(
    private platform: Platform,
    private purchaseService: PurchaseService,
    private feedbackService: FeedbackService,
    private cs: ContentService,
    private themeDetection: ThemeDetection,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    // The router element for productType
    this.productType = this.router.url.split('/').pop() as 'subs' | 'inapp'

    // Listen for onPurchase event (Doesn't work), the
    if (this.platform.is('capacitor') && this.platform.is('android')) {
      Store.addListener('onPurchase', (purchases:{purchases:AndroidProduct[]}) => {
        console.log("Fire onPurchase event from promo-code-android !!!!!")
        console.log("It should be merged with rxjs in order to work perfectly for a better user pathway")
      })
    }

    // 1. Listen when the user is back in the webview (doesn't work on android)
    /* window.addEventListener('focus', () => {
      if(this.router.url.includes('promo-code-android')){
        this.feedbackService.registerNow("User is back in the webview", "secondary")
        this.userIsBack$.next(true)
      }
    }) */

    // 2. Using 'resume' from capacitor plugin
    App.addListener('resume', () => {
      this.onResume$.next(true)
    })

    // 3. Handle the 'merged' subscription

    combineLatest([this.submitted$, this.onResume$])
    .pipe(filter(()=>false))
    .subscribe(async([submitted, onResume])=>{
      if(submitted && onResume){
        // this.feedbackService.registerNow("User is back in the webview after entering promo code", "secondary")
        console.log("User is back in the webview after entering promo code")

        this.formIsLoading = false

        // Check user entitlements
        let newEntitlements = await this.getEntitlements()
        console.log(`Entitlement retrieved: ${JSON.stringify(newEntitlements)}`)

        let currentTokens = this.currentEntitlement.map(e=>e.purchaseToken)
        let newTokens = newEntitlements.map(e=>e.purchaseToken)
        let addedTokens = newTokens.filter(e=>!currentTokens.includes(e))
        this.currentEntitlement = newEntitlements

        if (addedTokens.length == 0) {
          this.feedbackService.registerNow("Aucun achat n'a été enregistré", "dark")
          return
        } else if (addedTokens.length > 1) {
          this.feedbackService.registerNow("Plusieurs achats ont été enregistrés", "warn")
        }

        let entitlements = newEntitlements.filter(e=>addedTokens.includes(e.purchaseToken))
        console.log("Entitlements: " + JSON.stringify(entitlements))
        this.cs.post('/users/sync-entitlements', {
          entitlements: entitlements,
          platform: 'android' // Must be android since iOS handle it differently
        })
        .pipe(catchError(err=>{
          console.log("Error while syncing entitlements")
          console.log(err)
          this.feedbackService.registerNow("Erreur lors de la synchronisation des achats", "danger")
          return throwError(()=>err)
        }), finalize(()=>{this.formIsLoading = false}))
        .subscribe(res=>{
          console.log("Entitlements have been synced to the server")
          this.feedbackService.registerNow("Achat enregistré", "dark")

          this.prepareSuccessFeedback(entitlements[0])
        })

        // let token = addedToken[0]
        // let entitlement = newEntitlements.find(e=>e.purchaseToken == token)

        // Redirect the user to the home page (as usual)
        // console.log("Current entitlements: " + JSON.stringify(this.currentEntitlement))
        // console.log("New entitlements: " + JSON.stringify(newEntitlements))


        // We are here

        // Register IAP Transaction

        // Old code (doesn't work)
        /*this.cs.post('/payments/registerAndroidIAPTransaction', entitlement)
        .subscribe(res=>{
          console.log("Transaction has been registered")
          this.feedbackService.registerNow("Entitlement has been synced to server " + entitlement.products.join("+"), "success")

          console.log(res)
        })*/
        
      } else {
        this.formIsLoading = false
      }
    })

    // Testing the android entitlements
    this.getEntitlements().then(res=>{
      this.itemList = res
      this.cdr.detectChanges()
    })  

    // The dark mode (the code below is reused, should be refactored)
    try {
      this.useDarkMode = await this.isDarkModeAvailable() && (await this.isDarkModeEnabled()).value;
    } catch (e) {
      console.log("Getting device theme not available on web");
    }
  }

  async prepareSuccessFeedback(entitlement:AndroidEntitlement){
    // The code below is redundant, should be refactored
    let productId = entitlement.products[0] // It is assumed that the user has only one product
    let feedbackOpts = {
      type: 'modal',
      buttonText: null,
      primaryButtonText: (productId.includes('foodcoach') || productId.includes('smiley')) ? 'Prendre contact avec mon nutritionniste' : 'Prendre contact avec mon coach',
      secondaryButtonText: 'Retour à l\'accueil',
      primaryButtonAction: '/chat',
      secondaryButtonAction: '/home',
      modalImage: this.useDarkMode ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
    }
    /**
     * In the future, this part should be refactored to a better code quality
     */
    let content;
    if(productId.includes('foodcoach')){
      content = 'Votre nutritionniste prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
        'de planifier votre programme nutritionnel en fonction de vos attentes'
    }else if(productId.includes('sportcoach')){
      content = 'Votre coach prendra contact avec vous dans les prochaines 24h afin de programmer et ' +
        'de planifier votre programme sportif en fonction de vos attentes'
    }else if(productId.includes('trainer')){
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
    this.router.navigate(['/home'])
  }

  async submit(){
    this.formIsLoading = true
    this.currentEntitlement = await this.getEntitlements()

    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    let url = "https://play.google.com/redeem?code=" + this.form.value.promoCode
    from(Store.openAndroidPromoDeepLink({url: url}))
      .pipe(
        catchError(err=>{
          console.log("Error while opening the promo code deep link")
          return throwError(()=>err)
        }),
        switchMap(()=>this.onResume$.pipe(take(1))),
        switchMap(()=>{
          return from(this.getEntitlements())
        }),
        switchMap((newEntitlements:any[])=>{
          console.log("User finished entering the code")
          console.log("Here are newEntitlements: " + JSON.stringify(newEntitlements))
          let currentTokens = this.currentEntitlement.map(e=>e.purchaseToken)
          let newTokens = newEntitlements.map(e=>e.purchaseToken)
          let addedTokens = newTokens.filter(e=>!currentTokens.includes(e))
          this.currentEntitlement = newEntitlements
  
          if (addedTokens.length == 0) {
            this.feedbackService.registerNow("Aucun achat n'a été enregistré", "dark")
            return throwError(()=>new Error("No purchase has been registered"))
          } else if (addedTokens.length > 1) {
            this.feedbackService.registerNow("Plusieurs achats ont été enregistrés, veuillez signaler l'administrateur", "warn")
          }
          let addedToken = addedTokens[0]
          console.log("Purchase token is : " + addedToken)

          // added entitlements (expected to have length == 1)
          let addedEntitlements = newEntitlements.filter(e=>e.purchaseToken == addedToken)

          // Acknowledge the purchase
          return from(Store.acknowledgeAndroidPurchase({purchaseToken: addedToken}))
            .pipe(
              map((res)=>{
                return {res, addedEntitlements}
              }),
              catchError(err=>{
                console.error(`Error while acknowledging purchase: ${JSON.stringify(err)}`)
                this.formIsLoading = false
                return throwError(()=>err)
              })
            )
        }),
        switchMap(({res, addedEntitlements})=>{
          // Sync the entitlements to the backend server
          console.log(`Purchase acknowledged: ${JSON.stringify(res)}, ${JSON.stringify(addedEntitlements)}`)
          return from(this.cs.post('/users/sync-entitlements', {
            entitlements: addedEntitlements,
            platform: 'android'
          }))
          .pipe(
            map((res)=>{return {res, entitlements: addedEntitlements}}),
            catchError(err=>{
              console.log(`Error while syncing entitlements: ${JSON.stringify(err)}`)
              this.feedbackService.registerNow(`Erreur lors de la synchronisation des achats`, "danger")
              return throwError(()=>err)
            })
          )
        })
      )
      .subscribe(({res, entitlements: addedEntitlements})=>{
        // res is a result from 'http' request
        this.feedbackService.registerNow("Achat enregistré", "dark")
        this.prepareSuccessFeedback(addedEntitlements[0])
      })
  }

  async getEntitlements(): Promise<AndroidEntitlement[]>{
    let androidData = (await this.purchaseService.getAndroidEntitlements(this.productType)) as any as {entitlements: AndroidEntitlement[]}
    return androidData.entitlements
  }

  async verifyEntitlements(event){
    let androidData = (await this.purchaseService.getAndroidEntitlements(this.productType)) as any as {entitlements: AndroidEntitlement[]}
    console.log("Fetch data from android")
    let list = androidData.entitlements.map(e=>e.products.join('+')).join(", ")
    this.feedbackService.registerNow("Android Entitlements[L] : " + list, "secondary")
  }

  async consume(product:AndroidEntitlement){
    Store.forceAndroidConsumeProduct({purchaseToken: product.purchaseToken}).then(res=>{
      this.feedbackService.registerNow("Android product has been consumed", "success")
      this.itemList = this.itemList.filter(e=>e.purchaseToken != product.purchaseToken)
      this.cdr.detectChanges()
    })
  }


  /**
   * The code below is redundant, should be refactored for better code quality
   */
  private async isDarkModeAvailable(): Promise<any> {
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      return dark_mode_available;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * The code below is redundant, should be refactored for better code quality
   */
  private async isDarkModeEnabled(): Promise<ThemeDetectionResponse> {
    try {
      let dark_mode_enabled: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      return dark_mode_enabled;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
