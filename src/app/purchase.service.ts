import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";
import StorePlugin, { AndroidProduct, Product } from './custom-plugins/store.plugin';
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
  async getProducts(): Promise<{ products: Product[]}> {
    // Fetch the list of products from the store
    // Check if on web
    if (this.platform.is('cordova')){
      if (this.platform.is('ios')) {
        let products:Product[] = (await StorePlugin.getProducts({})).products
        return {
          products: products
        }
      } else if (this.platform.is('android')) {
        let AndroidProductList:AndroidProduct[] = (await StorePlugin.getProducts({})).products
        let products:Product[] = AndroidProductList.map((product:AndroidProduct) => {
          return {
            displayPrice: product.oneTimePurchaseOfferDetails.formattedPrice,
            description: product.description,
            displayName: product.name,
            id: this.androidIosProductNameMap[product.productId],
            price: product.oneTimePurchaseOfferDetails.priceAmountMicros / 1000000
          }
        })
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
  async purchaseProductById(productId:string) {
    if (this.platform.is('capacitor') && this.platform.is('android')){
      // Reverse mapping
      productId = this.iosAndroidProductNameMap[productId]
    }
    return await StorePlugin.purchaseProductById({productId: productId})
  }

  // Method 3(experimental features): Load entitlements from Android
  async getAndroidEntitlements() {
    if (this.platform.is('capacitor') && this.platform.is('android')){
      return await StorePlugin.getAndroidEntitlements();
    }
    return null;
  }
}
