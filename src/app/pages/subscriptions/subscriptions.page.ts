import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
// import {PurchaseService} from "../../purchase.service";
import {environment} from "../../../environments/environment";
import StorePlugin, { Product } from "../../custom-plugins/store.plugin";
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


  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService,
    private platform: Platform
  ) {
    super()
  }

  async ngOnInit() {
    // 1. Loading product list from the StorePlugin (deprecated, should use purchase service now)
    if (this.platform.is('ios')) { // TODO later: unify
      let productList
      try {
        productList = (await StorePlugin.getProducts({})).products
        this.feedbackService.registerNow('loading products from native plugin ' + JSON.stringify(productList), 'success')
      } catch (error) {
        console.error('Error loading products:', error);
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
      this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
      this.user = await this.contentService.getUserFromLocalStorage()
      console.log("load products from store")
      console.log(this.productList)
      await this.loadEntitlements()
    } else if (this.platform.is('android')) { // TODO later: unify
      let productList: Product[];
      try {
        productList = (await this.purchaseService.getProducts()).products;
      } catch (error) { // TODO later: unify
        console.error('Error loading products:', error);
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    }
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

  testPurchase(productId:string){ // Unused, should be removed
    // Todo: remove this function
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
