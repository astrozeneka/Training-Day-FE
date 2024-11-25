import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
// import {PurchaseService} from "../../purchase.service";
import {environment} from "../../../environments/environment";
import StorePlugin, { AndroidSubscription, Product } from "../../custom-plugins/store.plugin";
import {Platform} from "@ionic/angular";
import {EntitlementReady} from "../../abstract-components/EntitlementReady";
import { PurchaseService } from 'src/app/purchase.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage extends EntitlementReady implements OnInit {
  productList: any = {}
  user:any = null

  // 7. Platform variable
  is_ios = false;
  is_android = false;

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService,
    private platform: Platform
  ) {
    super()

    // 7. Platform variable
    this.is_ios = this.platform.is('capacitor') && this.platform.is('ios');
    this.is_android = this.platform.is('capacitor') && this.platform.is('android');
  }

  async ngOnInit() {
    let productList: Product[] = []
    // 1. Loading product list from the StorePlugin (deprecated, should use purchase service now)
    if (this.platform.is('ios')) { // TODO later: unify
      try {
        productList = (await StorePlugin.getProducts({})).products
      } catch (error) {
        // console.error('Error loading products:', error);
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
      // console.log("load products from store")
      // console.log(this.productList)
      await this.loadEntitlements()
    } else if (this.platform.is('android') && this.platform.is('capacitor')) { // TODO later: unify
      try {
        productList = (await this.purchaseService.getProducts('subs')).products;
      } catch (error) { // TODO later: unify
        // console.error('Error loading products:', error);
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    }
    this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
    this.user = await this.contentService.getUserFromLocalStorage()
  }

  async clickOption(option: string){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      this.contentService.storage.set('subscription_option', option)
      this.router.navigate(['/subscriptions-duration'])
    }

  }

  async clickSubscriptionOption(productId: string){
    let user = this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      if(environment.paymentMethod === 'stripe') {
        this.feedbackService.registerNow('Stripe payment method is not supported', 'method')
      }else if(environment.paymentMethod === 'inAppPurchase'){
        await this.contentService.storage.set('productId', productId)
        if(this.platform.is('android')){ // Android subscription need to pass the offerToken
          let offerToken = this.productList[productId].androidOfferToken
          console.log("Offer token is : " + offerToken)
          await this.contentService.storage.set('offerToken', offerToken)
        }
        this.router.navigate(['/purchase-invoice'])
      }
    }
  }

  manageSubscription(){

    if(this.platform.is('ios') || true){
      let res = StorePlugin.present({
        message: "Manage subscription"
      })
    }else{
      this.feedbackService.registerNow('This feature is not available on this platform', 'warning')
    }
  }

  protected readonly environment = environment;
}
