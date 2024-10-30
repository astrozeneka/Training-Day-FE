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
    'foodcoach__45d': 'foodcoach_6w' 
  }

  constructor(
    private platform: Platform,
    private feedbackService: FeedbackService
  ) {
    
  }

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
}
