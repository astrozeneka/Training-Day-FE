import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ContentService } from 'src/app/content.service';
import { AndroidSubscription, Product } from 'src/app/custom-plugins/store.plugin';
import { FeedbackService } from 'src/app/feedback.service';
import { PurchaseService } from 'src/app/purchase.service';
import { User } from 'src/app/models/Interfaces';
import StorePlugin from 'src/app/custom-plugins/store.plugin';
import { environment } from 'src/environments/environment';
import { EntitlementReady } from 'src/app/abstract-components/EntitlementReady';

type IOSSubscription = Product
type Subscription = IOSSubscription|AndroidSubscription

@Component({
  selector: 'app-store-auto-renewables',
  templateUrl: './store-auto-renewables.component.html',
  styleUrls: ['./store-auto-renewables.component.scss'],
})
export class StoreAutoRenewablesComponent extends EntitlementReady implements OnInit {

  user: User|null = null

  // iosProductList: { [key: string]: IOSProduct } = {}
  // androidProductList: { [key: string]: AndroidProduct } = {}
  productList: { [key: string]: Product } = {}

  // Platform variables
  is_ios = false;
  is_android = false;

  constructor(
    private cs: ContentService,
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

  ngOnInit() {
    // 1. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.user = user;
    })

    // 2. Load product list from the purchase service
    let products: Promise<{products: IOSSubscription[]|AndroidSubscription[]}>
    if (this.platform.is('capacitor') && this.platform.is('ios')){
      try {
        // Load from IOS
        products = StorePlugin.getProducts({})
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    } else if (this.platform.is('capacitor') && this.platform.is('android')) {
      try {
        // Load from Android
        products = this.purchaseService.getProducts('subs')
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    } else {
      try {
        // Load dummy data for debugging
        products = StorePlugin.getProducts({})
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from web', 'danger');
      }
    }
    products.then(({products}) => {
      this.productList = (products as Subscription[]).reduce((acc, product) => {
        acc[(product as IOSSubscription).id || (product as AndroidSubscription).productId] = product
        return acc
      }, {} as any)
    })
  }

  async clickOption(option: string){
    if(!this.user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      this.cs.storage.set('subscription_option', option)
      this.router.navigate(['/subscriptions-duration'])
    }
  }

  async clickSubscriptionOption(productId: string){
    if(!this.user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      await this.cs.storage.set('productId', productId)
        if(this.platform.is('android')){ // Android subscription need to pass the offerToken
          let offerToken = (this.productList[productId] as any as AndroidSubscription).androidOfferToken
          console.log("Offer token is : " + offerToken)
          await this.cs.storage.set('offerToken', offerToken)
        }
        this.router.navigate(['/purchase-invoice'])
    }
  }

  manageSubscription(){
    if(this.platform.is('ios')){
      let res = StorePlugin.present({
        message: "Manage subscription"
      })
    }else{
      this.feedbackService.registerNow('This feature is not available on this platform', 'warning')
    }
  }

}
