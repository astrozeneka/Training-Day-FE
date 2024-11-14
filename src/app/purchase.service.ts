import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";
import StorePlugin, { AndroidProduct, AndroidSubscription, Product } from './custom-plugins/store.plugin';
import { FeedbackService } from './feedback.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService { // This class cannot be used anymore due to android updates

  private androidIosProductNameMap: { [key: string]: string } = {
    'foodcoach__7d': 'foodcoach_1w',
    'foodcoach__30d': 'foodcoach_4w',
    'foodcoach__45d': 'foodcoach_6w',

    'sportcoach__7d': 'sportcoach_1w',
    'sportcoach__30d': 'sportcoach_4w',
    'sportcoach__45d': 'sportcoach_6w'
  }
  private iosAndroidProductNameMap: { [key: string]: string } = {
    'foodcoach_1w': 'foodcoach__7d',
    'foodcoach_4w': 'foodcoach__30d',
    'foodcoach_6w': 'foodcoach__45d',

    'sportcoach_1w': 'sportcoach__7d',
    'sportcoach_4w': 'sportcoach__30d',
    'sportcoach_6w': 'sportcoach__45d'
  }

  constructor(
    private platform: Platform,
    private feedbackService: FeedbackService
  ) {
    
  }

  // Method 1: Get the list of products
  // Type is only required for android
  async getProducts(type=null): Promise<{ products: Product[]}> {
    // Fetch the list of products from the store
    // Check if on web
    if (this.platform.is('capacitor')){ // cordova ??? maybe capacitor
      let products:Product[] = [];
      if (this.platform.is('ios')) {
        products = (await StorePlugin.getProducts({})).products
        return {
          products: products
        }
      } else if (this.platform.is('android')) {
        // The typo can lead to confusion
        let androidProductList:AndroidProduct[]|AndroidSubscription[] = (await StorePlugin.getProducts({type: type})).products
        // Standardize the output format to fit the existing front-end code
        if (type == 'inapp' || type == null) { // In-app purchases (default)
          products = (androidProductList as AndroidProduct[]).map((product:AndroidProduct) => {
            return {
              displayPrice: product.oneTimePurchaseOfferDetails.formattedPrice,
              description: product.description,
              displayName: product.name,
              id: this.androidIosProductNameMap[product.productId],
              price: product.oneTimePurchaseOfferDetails.priceAmountMicros / 1000000
            }
          })
        } else if (type == 'subs') { // Subscriptions
          // The code below is experimental, may be subjected to future changes
          if (androidProductList.length == 0)
            throw new Error('No products found')
          else if (androidProductList.length > 1){
            throw new Error(`Multiple products found from Android Subscription List (${androidProductList.map(a=>(a as AndroidSubscription).name).join(', ')}), except to only have one`)
          }
          let androidProduct = (androidProductList as AndroidSubscription[])[0];
          
          androidProduct.subscriptionOfferDetails.forEach((offerDetail) => {
            // For this feature, the price phasing is not yet supported
            if (offerDetail.pricingPhases.length > 1)
              throw new Error('Multiple pricing phases found, except to only have one')
            if (offerDetail.pricingPhases.length == 0)
              throw new Error('No pricing phases found')
            let pricingPhase = offerDetail.pricingPhases[0]
            let capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
            console.log("AndroidOfferToken: ", offerDetail.offerIdToken)
            console.log("OfferDetail: ", JSON.stringify(offerDetail))
            products.push({
              displayPrice: pricingPhase.formattedPrice,
              description: "Abonnement " + capitalize(offerDetail.basePlanId),
              displayName: capitalize(offerDetail.basePlanId),
              id: offerDetail.basePlanId,
              price: pricingPhase.priceAmountMicros / 100000,
              androidOfferToken: offerDetail.offerIdToken
            })
          })
        }
        return {
          products: products
        }
      } else {
        this.feedbackService.registerNow('Platform not supported', 'danger')
        return {
          products: []
        }
      }
    } else {
      return (await StorePlugin.getProducts({})); // The debug data is returned
    }
  }

  // Method 2: Purchase a product by its ID
  // Product type is only required for android
  async purchaseProductById(productId:string, productType=null, offerToken=null) {
    // console.log("triggering purchase for", productId, ", type is ", productType)
    let extraParams = {}
    if (this.platform.is('capacitor') && this.platform.is('android')){
      // Reverse mapping
      productId = this.iosAndroidProductNameMap[productId] || productId // Map if exists, otherwise, use the original
      if (productType == "subs"){
        extraParams = {
          offerToken: offerToken
        }
      }
    }
    return await StorePlugin.purchaseProductById({productId: productId, type: productType, ...extraParams});
  }

  // Method 3(experimental features): Load entitlements from Android
  async getAndroidEntitlements() {
    if (this.platform.is('capacitor') && this.platform.is('android')){
      return await StorePlugin.getAndroidEntitlements();
    }
    return null;
  }

  // The redeem code
  async presentRedeemCodeSheet() {
    return StorePlugin.presentRedeemCodeSheet();
  }
}
