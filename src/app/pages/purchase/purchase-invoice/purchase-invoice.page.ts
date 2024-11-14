import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";
import StorePlugin, { AndroidProduct, Product, Transaction } from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";
import {FeedbackService} from "../../../feedback.service";
import {BehaviorSubject, catchError, filter, finalize} from "rxjs";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';
import { PurchaseService } from 'src/app/purchase.service';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.page.html',
  styleUrls: ['./purchase-invoice.page.scss'],
})
export class PurchaseInvoicePage implements OnInit {
  subscriptionSlug: string = "";
  subscriptionLabel: string = "";
  subscriptionDays: number = 0;
  subscriptionConsumables: number = 0;
  subscriptionExtraInfo: string = ""; // Duration or quantity
  subscriptionPrice: number = 0;

  productList:any = {} // Bound to the Store
  productId:string|undefined = undefined
  offerToken:string|undefined = undefined // Used for subscriptions

  acceptConditions: FormControl = new FormControl(false);

  isLoading: boolean = false;
  loadingStep: string = null;

  // 2. Determine the product type depending on the productId
  // productId:string|undefined = undefined
  productType: string = null; // (only required for Android)
  productDataBS: BehaviorSubject<{id: string, type: string}> = new BehaviorSubject(null)

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router,
    private themeDetection: ThemeDetection,
    private purchaseService: PurchaseService,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {
    this.contentService.storage.get('subscription_slug').then((value) => {
      this.subscriptionSlug = value;
    });
    this.contentService.storage.get('subscription_label').then((value) => {
      this.subscriptionLabel = value;
    });
    this.contentService.storage.get('subscription_days').then((value) => {
      this.subscriptionDays = value;
      if(this.subscriptionDays){
        this.subscriptionExtraInfo = this.subscriptionDays + " jours";
      }
    });
    this.contentService.storage.get('subscription_consumable').then((value) => {
      this.subscriptionConsumables = value;
      if(this.subscriptionConsumables){
        this.subscriptionExtraInfo = this.subscriptionConsumables + " séance(s)";
      }
    });
    this.contentService.storage.get('subscription_price').then((value) => {
      this.subscriptionPrice = value;
    });

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

    // The dark mode (the code below is reused, should be refactored)
    try {
      this.useDarkMode = await this.isAvailable() && (await this.isDarkModeEnabled()).value;
    } catch (e) {
      console.log("Getting device theme not available on web");
    }

    // In the future, should find a common architecture that
    // both Android and iOS can use
    // 2. Listen for the purchase event (only on Android)
    if (this.platform.is('capacitor') && this.platform.is('android')) {
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
      // On Purchase abortion
      StorePlugin.addListener('onPurchaseAborted', (data)=>{
        if (this.isLoading){
          this.isLoading = false
          this.loadingStep = null
          this.cdr.detectChanges()
          this.feedbackService.registerNow("Transaction annulée par l'utilisateur", "danger") // Not consistent with the IOS architecture
        }
      })
    }
  }

  async continueToPayment(){
    if(environment.paymentMethod == 'inAppPurchase' && this.platform.is('capacitor')){
      this.isLoading = true
      if (this.platform.is('android')){
        this.loadingStep = "(1/2) Connexion à Google Play"
      } else {
        this.loadingStep = "(1/2) Connexion à l'App Store"
      }
      // Confirm purchase
      //let res:any = (await StorePlugin.purchaseProductById({productId: this.productId!})) as any;
      console.log("Calling purchaseProductById, productId: " + this.productId + ", productType: " + this.productType)
      let productId = this.productId;
      if (this.productType == 'subs' && this.platform.is('android')) productId = 'training_day'; // Applying patch (only for android)
      
      let res:{success:any, transaction:any}
      try {
        res = (await this.purchaseService.purchaseProductById(productId!, this.productType!, this.offerToken)) as any;
        console.log("Purchase result: " + JSON.stringify(res), "info")
      } catch (e) {
        console.log("Error in purchaseProductById: " + JSON.stringify(e), "error")
        this.feedbackService.registerNow(e.message, "danger")
        this.isLoading = false
        this.loadingStep = null
      }
      // Android flow ends here
      if (this.platform.is('ios')){
        // IMPORTANT: In iOS, the following data should added to the transaction (this code part should normally managed by the native code)
        // TODO later, put the code below inside the native code
        res.transaction.currency = 'EUR' // TODO, update to local currency
        res.transaction.amount = this.productList[this.productId as string].price * 100 // No need to apply patch for iOS
        res.transaction.product_id = this.productId
        this.purchaseCompleted(res.transaction)
      }
      // The android counterparts will use the plugin eveing listener
      
      
      return;
      this.contentService.post('/payments/registerIAPTransaction', res.transaction)
        .pipe(catchError(err => {
          // Print error code
          console.error(err)
          this.feedbackService.registerNow("Erreur: " + err.error.message, "error")
          return err
        }), finalize(() => {
          this.isLoading = false
        }))
        .subscribe((response:any)=> {
          console.log("Retrieve response after purchase")
          //this.feedbackService.register('Votre achat a été enregistré. Vous pouvez maintenant profiter de votre achat.')
          let feedbackOpts = {
            buttonText: null,
            primaryButtonText: this.productId.includes('foodcoach') ? 'Prendre contact avec mon nutritionniste' : 'Prendre contact avec mon coach',
            secondaryButtonText: 'Retour à l\'accueil',
            primaryButtonAction: '/chat',
            secondaryButtonAction: '/home',
            modalImage: this.useDarkMode ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
          }
          if(["hoylt", "moreno", "alonzo"].includes(this.productId)){ // Auto-renewables
            this.feedbackService.register(
              null,
              'success',
              {
                type: 'modal',
                modalTitle: "Votre achat d'abonnement a été effectué",
                modalContent: 'Bienvenue chez Training Day vous pouvez dès à présent prendre rendez-vous avez votre coach',
                ...feedbackOpts
              }
            )
          }else{ // Non-renewables
            console.log(this.productId)
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
                type: 'modal',
                modalTitle: 'Votre achat a été effectué',
                modalContent: content,
                ...feedbackOpts
              }
            )
          }
          this.router.navigate(['/home'])
        })
      console.log("Purchase result:")
      console.log(res)
      
    }else{
      this.feedbackService.registerNow("The payment purchase is not availble", "danger")
    }
  }

  // A common platform to handle both iOS and Android purchases
  private purchaseCompleted(product: Product|AndroidProduct){
    this.loadingStep = "(2/2) Enregistrement de l'achat"
    this.cdr.detectChanges()
    console.log("Processing purchase completed"); // WE ARE HERE
    let url = ""
    if (this.platform.is('ios')){
      url = '/payments/registerIAPTransaction'
    }else if(this.platform.is('android') && this.platform.is('capacitor')){
      url = '/payments/registerAndroidIAPTransaction';
      // Patch the product_id (for android only)
      (product as AndroidProduct).productId = this.productId
    }
    this.contentService.post(url, product)
      .pipe(catchError(err => {
        console.error("StorePlugin error: " + JSON.stringify(err));
        this.feedbackService.registerNow("Erreur: " + err.error.message, "error")
        return err
      }), finalize(() => { this.isLoading = false }))
      .subscribe((response:any) => { // Typing should be
        console.log("Retrieve response after purchase")
        // This is not the good practice when logging
        // this.feedbackService.registerNow("Success: " + JSON.stringify(response), "success")
        this.redirectWithFeedback()
        // TODO continue
        return;

      })
  }

  private redirectWithFeedback(){
    let feedbackOpts = {
      buttonText: null,
      primaryButtonText: this.productId.includes('foodcoach') ? 'Prendre contact avec mon nutritionniste' : 'Prendre contact avec mon coach',
      secondaryButtonText: 'Retour à l\'accueil',
      primaryButtonAction: '/chat',
      secondaryButtonAction: '/home',
      modalImage: this.useDarkMode ? 'assets/logo-dark-cropped.png' : 'assets/logo-light-cropped.png',
    }
    if(["hoylt", "moreno", "alonzo"].includes(this.productId)){ // Auto-renewables
      this.feedbackService.register(
        null,
        'success',
        {
          type: 'modal',
          modalTitle: "Votre achat d'abonnement a été effectué",
          modalContent: 'Bienvenue chez Training Day vous pouvez dès à présent prendre rendez-vous avez votre coach',
          ...feedbackOpts
        }
      )
    }else{ // Non-renewables
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
          type: 'modal',
          modalTitle: 'Votre achat a été effectué',
          modalContent: content,
          ...feedbackOpts
        }
      )
    }
    this.router.navigate(['/home'])
  }

  protected readonly environment = environment;

  useDarkMode: boolean = true;
  /**
   * The code below is redundant, should be refactored for better code quality
   */
  private async isAvailable(): Promise<any> {
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      return dark_mode_available;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  private async isDarkModeEnabled(): Promise<ThemeDetectionResponse> {
    try {
      let dark_mode_enabled: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      return dark_mode_enabled;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // 10. Open CGV
  openCGV(){
    let url = environment.rootEndpoint + environment.cgv_uri
    if (this.platform.is('capacitor')) {
      Browser.open({url: url})
    }else{
      window.open(url, '_blank')
    }
  }
}
