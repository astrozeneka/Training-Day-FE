import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";
import StorePlugin from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";
import {FeedbackService} from "../../../feedback.service";
import {catchError, finalize} from "rxjs";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';

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

  acceptConditions: FormControl = new FormControl(false);

  isLoading: boolean = false;
  loadingStep: string = null;

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router,
    private themeDetection: ThemeDetection
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
    this.contentService.storage.get('productId').then((value) => {
      this.productId = value;
    });
  }

  async ngOnInit() {
    let productList = (await StorePlugin.getProducts({})).products
    for(let product of productList){
      this.productList[product.id] = product
    }

    // The dark mode (the code below is reused, should be refactored)
    try {
      this.useDarkMode = await this.isAvailable() && (await this.isDarkModeEnabled()).value;
    } catch (e) {
      console.log("Getting device theme not available on web");
    }
  }

  async continueToPayment(){
    if(environment.paymentMethod == 'inAppPurchase'){
      this.isLoading = true
      this.loadingStep = "(1/2) Connexion à l'App Store"
      // Confirm purchase
      let res:any = (await StorePlugin.purchaseProductById({productId: this.productId!})) as any;
      res.transaction.currency = 'EUR' // TODO, update to local currency
      res.transaction.amount = this.productList[this.productId as string].price * 100
      res.transaction.product_id = this.productId
      this.loadingStep = "(2/2) Enregistrement de l'achat"
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
}
