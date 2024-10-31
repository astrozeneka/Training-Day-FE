import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import StorePlugin, { Product } from "../../../custom-plugins/store.plugin";
import {environment} from "../../../../environments/environment";
import { PurchaseService } from 'src/app/purchase.service';

@Component({
  selector: 'app-sport-program',
  templateUrl: './sport-program.page.html',
  styleUrls: ['./sport-program.page.scss'],
})
export class SportProgramPage implements OnInit {
  // override subscriptionSlug:string = "sport-program";
  // override subscriptionLabel:string = "Programme sportif";
  productList: any = {}; // Bound to iOS/Android In-App Purchase
  user: any;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService
  ) {
  }

  async ngOnInit() {
    let productList:Product[] = (await this.purchaseService.getProducts()).products
    this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
    console.log("Loading products", JSON.stringify(this.productList))
    this.user = await this.contentService.getUserFromLocalStorage()
  }

  async clickSportCoachOption(productId:string) {
    let user = await this.contentService.storage.get('user')
    if (!user) {
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    } else {
      if (environment.paymentMethod == 'stripe') {
        this.feedbackService.registerNow('Stripe payment method is not supported', 'method')
      } else if (environment.paymentMethod === 'inAppPurchase') {
        await this.contentService.storage.set('productId', productId)
      }
      this.router.navigate(['/purchase-invoice'])
    }
  }
}
