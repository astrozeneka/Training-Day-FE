import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";
import StorePlugin from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";
import {FeedbackService} from "../../../feedback.service";
import {catchError} from "rxjs";

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

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private router: Router
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
  }

  async continueToPayment(){
    if(environment.paymentMethod == 'stripe') {
      this.feedbackService.registerNow('Stripe payment method is not supported', 'error')
      // this.router.navigate(['/purchase-payment'])
    }else if(environment.paymentMethod == 'inAppPurchase'){
      // Confirm purchase
      let res:any = (await StorePlugin.purchaseProductById({productId: this.productId!})) as any;
      res.transaction.currency = 'EUR' // TODO, update to local currency
      res.transaction.amount = this.productList[this.productId as string].price * 100
      res.transaction.product_id = this.productId
      this.contentService.post('/payments/registerIAPTransaction', res.transaction)
        .pipe(catchError(err => {
          // Print error code
          console.error(err)
          this.feedbackService.registerNow("Erreur: " + err.error.message, "error")
          return err
        }))
        .subscribe((response:any)=> {
          console.log("Retrieve response after purchase")
          this.feedbackService.register('Votre achat a été enregistré. Vous pouvez maintenant profiter de votre achat.')
          this.router.navigate(['/home'])
        })
      console.log("Purchase result:")
      console.log(res)
    }
  }

  protected readonly environment = environment;
}
