import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {PurchaseService} from "../../purchase.service";
import {environment} from "../../../environments/environment";
import StorePlugin from "../../custom-plugins/store.plugin";
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {
  productList: any = {}
  user:any = null

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService,
    private platform: Platform
  ) {
    /*this.router.events.subscribe(async (event) => {
      if(event instanceof NavigationEnd && event.url == '/subscriptions'){
        this.user = await this.contentService.storage.get('user')
        console.log(this.user)
        this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
  }
    })*/
  }

  async ngOnInit() {
    let productList = (await StorePlugin.getProducts({})).products
    this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
    this.user = await this.contentService.getUserFromLocalStorage()
    console.log("load products from store")
    console.log(this.productList)
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

  testPurchase(productId:string){
    console.log("Click button")
    this.purchaseService.purchase(productId)
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
