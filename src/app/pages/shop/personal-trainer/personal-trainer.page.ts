import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import StorePlugin from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-personal-trainer',
  templateUrl: './personal-trainer.page.html',
  styleUrls: ['./personal-trainer.page.scss'],
})
export class PersonalTrainerPage implements OnInit {
  productList:any = {}
  user: any;
  environment = environment;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) { }

  async ngOnInit() {
    // Load the product list from the Store
    let productList = (await StorePlugin.getProducts({})).products
    this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});

    // Check if the user has already subscribed to the food program
    this.user = await this.contentService.getUserFromLocalStorage()
    console.log(this.user)
  }

  /**
   *
   * @param coachingNumber  number of session
   * @param price     price to be paid for the coaching
   * @param productID fallback parameter in case the configuration is set to use inAppPurchase instead of stripe
   */
  async clickCoachingOption(coachingNumber:number, price:number, productId:string){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      if(environment.paymentMethod === 'stripe') {
        await this.contentService.storage.set('subscription_days', undefined);
        await this.contentService.storage.set('subscription_consumable', coachingNumber)
        await this.contentService.storage.set('subscription_price', price)
        await this.contentService.storage.set('subscription_slug', 'personal-trainer')
        await this.contentService.storage.set('subscription_label', 'Personal trainer')
        this.feedbackService.registerNow('Stripe payment method is not supported', 'method')
      }else if(environment.paymentMethod === 'inAppPurchase'){
        await this.contentService.storage.set('productId', productId)
        this.router.navigate(['/purchase-invoice'])
      }
    }
  }

}
