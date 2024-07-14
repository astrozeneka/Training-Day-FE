import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import StorePlugin from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-food-program',
  templateUrl: './food-program.page.html',
  styleUrls: ['./food-program.page.scss'],
})
export class FoodProgramPage implements OnInit{
  // override subscriptionSlug:string = "food-program"; // Deprecated
  // override subscriptionLabel:string = "Programme alimentaire"; // Deprecated
  productList: any = {}; // Bound to iOS/Android In-App Purchase
  user: any;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
  }

  async ngOnInit() {
    // Load the user data (to check if there is already active subscription)
    let productList = (await StorePlugin.getProducts({})).products
    this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});

    // Check if the user has already subscribed to the food program
    this.user = await this.contentService.getUserFromLocalStorage()
    console.log(this.user)
  }

  async clickFoodCoachOption(productId:string){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      if (environment.paymentMethod == 'stripe'){
        this.feedbackService.registerNow('Stripe payment method is not supported', 'method')
      }else if(environment.paymentMethod === 'inAppPurchase'){
        await this.contentService.storage.set('productId', productId)
      }
      this.router.navigate(['/purchase-invoice'])
    }
  }
}
