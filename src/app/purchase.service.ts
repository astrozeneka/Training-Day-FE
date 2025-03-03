import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";
import StorePlugin, { AndroidProduct, AndroidSubscription, Product, PromoOfferIOS, StorePluginEvent } from './custom-plugins/store.plugin';
import { FeedbackService } from './feedback.service';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, filter, merge, Observable, Subject } from 'rxjs';
import { ContentService } from './content.service';

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

  os:'ios'|'android' = null

  // Promotional offers (cached using the usual loading mechanism)
  promoOffers: {[key:string]: StoredData<PromoOfferIOS[]>} = {}
  promoOffersSubject: {[key:string]: BehaviorSubject<PromoOfferIOS[]>} = {}
  promoOffers$: {[key:string]: Observable<PromoOfferIOS[]>} = {}
  

  constructor(
    private platform: Platform,
    private feedbackService: FeedbackService,
    private cs: ContentService
  ) {
    if (!platform.is('capacitor')){
      StorePlugin.onEmulatedOS().subscribe((os) => {
        this.os = os
      })
    } else {
      if (this.platform.is('android')){
        this.os = 'android'
      } else {
        this.os = 'ios'
      }
    }
  }

  // Method 1: Get the list of products
  // Type is only required for android
  async getProducts(type=null): Promise<{ products: Product[]}> {
    // Fetch the list of products from the store
    // Check if on web
    if (true){
      let products:Product[] = [];
      console.log(this.os)
      if (this.os == 'ios') {
        products = (await StorePlugin.getProducts({})).products
        return {
          products: products
        }
      } else if (this.os == 'android') {
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
  async purchaseProductById(productId:string, productType=null, offerToken=null, os=null, offerId=null, offerSignatureInfo=null) {
    let extraParams = {} as any
    if (offerSignatureInfo){
      extraParams.iOSOfferSignature = offerSignatureInfo
      console.log(`Passing offerSignatureInfo: ${JSON.stringify(offerSignatureInfo)}`)
    }
    if (offerId)
      extraParams.offerId = offerId
    if (os == 'android'){
      // Reverse mapping
      productId = this.iosAndroidProductNameMap[productId] || productId // Map if exists, otherwise, use the original
      if (productType == "subs"){
        extraParams = {
          offerToken: offerToken
        }
      }
    }
    if (offerSignatureInfo){
      return await StorePlugin.purchaseProductWithDiscount({productId: productId, type: productType, ...extraParams}, os); // Why use os ??
    } else {
      return await StorePlugin.purchaseProductById({productId: productId, type: productType, ...extraParams}, os); // Why use os ??
    }
  }

  // Method 3(experimental features): Load entitlements from Android
  async getAndroidEntitlements() {
    if (this.platform.is('capacitor') && this.platform.is('android')){
      return await StorePlugin.getAndroidEntitlements();
    }
    return await StorePlugin.getAndroidEntitlements(); // Mocked data
  }

  // The redeem code
  async presentRedeemCodeSheet() {
    return StorePlugin.presentRedeemCodeSheet();
  }



  // Load promo offers
  onPromoOfferIOS(productId: string, fromCache=true, fromServer=true): Observable<PromoOfferIOS[]>{
    // Prepare dictionary
    if (!this.promoOffers[productId]){
      this.promoOffers[productId] = new StoredData<PromoOfferIOS[]>('promoOffers-' + productId, this.cs.storage)
      this.promoOffersSubject[productId] = new BehaviorSubject<PromoOfferIOS[]>(null)
      this.promoOffers$[productId] = this.promoOffersSubject[productId].asObservable()
    }

    let additionalEvents$ = new Subject<PromoOfferIOS[]>() // No need to use behavioral since the observable is subscribed before it fire data

    // 1. Fire from the cache
    if (fromCache) {
      this.promoOffers[productId].get().then((data:PromoOfferIOS[])=>{
        additionalEvents$.next(data)
      })
    }

    // 2. Load from server (device)
    if (fromServer) {
      StorePlugin.fetchPromotionalOffer({productId: productId}).then((data:{offers:PromoOfferIOS[]})=>{
        this.promoOffers[productId].set(data.offers)
        additionalEvents$.next(data.offers)
      })
    }

    // Prepare output
    let output$ = merge(this.promoOffers$[productId], additionalEvents$)
    output$ = output$.pipe(filter((data)=>data?.length>0))
    return output$
  }
}
