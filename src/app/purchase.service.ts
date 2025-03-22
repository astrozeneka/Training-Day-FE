import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";
import StorePlugin, { AndroidProduct, AndroidSubscription, Product, PromoOfferIOS, StorePluginEvent } from './custom-plugins/store.plugin';
import { FeedbackService } from './feedback.service';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, distinctUntilKeyChanged, filter, forkJoin, lastValueFrom, map, merge, Observable, of, Subject, take, tap } from 'rxjs';
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
    console.log("Calling getProducts")
    // Fetch the list of products from the store
    // Check if on web
    if (true){
      let products:Product[] = [];
      console.log(this.os)
      if (this.os == 'ios') {
        products = (await StorePlugin.getProducts({})).products
        console.log(`Ios fetching products: ${JSON.stringify(products)}`)
        // Load the related promotional offers
        /*for(let i=0; i<products.length; i++){
          let product = products[i]
          console.log(`Load promo for ${product.id}`)
          this.onPromoOfferIOS(product.id, true, true)
            .pipe(distinctUntilKeyChanged('length'))
            .subscribe((data)=>{
              console.log(`Promo offer loaded for ${product.id}: ${JSON.stringify(data)}`)
            })
        }*/
        let totalRegistered = 0;
        let totalFired = 0
        let observables = products.map((product)=>{
          totalRegistered+= 1
          return this.onPromoOfferIOS(product.id, false, true).pipe(
            take(1),
            //distinctUntilKeyChanged('length'), // No need to use since we have take(1)
            catchError((error)=>{
              // Should not pass here anyway
              console.log(`[] Error loading promo offer for ${product.id}: ${error}`)
              return of([])
            }),
            map((data:PromoOfferIOS[])=>{
              let promoOffers = data
              let promotedProduct = {
                ...product,
                offers: promoOffers
              }
              // Compute monthly prices
              let monthlyPrices = [product.price]
              promoOffers.forEach((offer)=>{
                monthlyPrices.push(this.computeIOSMonthlyPrice(offer))
              })
              if (monthlyPrices.length > 1){
                promotedProduct.baseOfferDisplayPrice = promotedProduct.displayPrice
                promotedProduct.displayPrice = `À partir de ${this.patchDisplayPrice(product.displayPrice, Math.min(...monthlyPrices))}/mois`
              }
              totalFired += 1
              return promotedProduct
            })
          )
        })
        // take(1) is used to simulate a complete event
        // If 'forkJoin' is used, should use take(1) as well
        let productsWithPromotion = await lastValueFrom(combineLatest(observables).pipe(take(1)))
        return {
          products: productsWithPromotion
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
            /*if (offerDetail.pricingPhases.length > 1)
              throw new Error('Multiple pricing phases found, except to only have one')*/
            if (offerDetail.pricingPhases.length == 0)
              throw new Error('No pricing phases found')
            let pricingPhases = offerDetail.pricingPhases
            let capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
            products.push({
              displayPrice: pricingPhases[0].formattedPrice,
              description: "Abonnement " + capitalize(offerDetail.basePlanId),
              displayName: capitalize(offerDetail.basePlanId),
              id: offerDetail.basePlanId,
              price: pricingPhases[0].priceAmountMicros / 1000000,
              androidOfferToken: offerDetail.offerIdToken,
              pricingPhases: pricingPhases
            })
          })
        }
        if (this.platform.is('android') && type == 'subs'){
          products = this.groupAndroidSubscriptionOffers(products)
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
    try{
      if (offerSignatureInfo){
        return await StorePlugin.purchaseProductWithDiscount({productId: productId, type: productType, ...extraParams}, os); // Why use os ??
      } else {
        console.log(`Purchasing the base offer, productId: ${productId}, productType: ${productType}, extraParams: ${JSON.stringify(extraParams)}, os: ${os}`)
        return await StorePlugin.purchaseProductById({productId: productId, type: productType, ...extraParams}, os); // Why use os ??
      }
    } catch (error){
      console.log("Error while purchasing product", error)
      throw error
    }
  }

  // Method 3(experimental features): Load entitlements from Android
  async getAndroidEntitlements(productType: 'subs' | 'inapp') {
    if (this.platform.is('capacitor') && this.platform.is('android')){
      if (productType == 'inapp') { 
        return await StorePlugin.getAndroidEntitlements();
      } else if (productType == 'subs') {
        return await StorePlugin.getAndroidSubscriptionEntitlements();
      } else {
        throw new Error(`Invalid product type: ${productType}`)
      }
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
        //if (data.length > 0)
        additionalEvents$.next(data)
      })
    }

    // 2. Load from server (device)
    if (fromServer) {
      StorePlugin.fetchPromotionalOffer({productId: productId}).then((data:{offers:PromoOfferIOS[]})=>{
        this.promoOffers[productId].set(data.offers)
        additionalEvents$.next(data.offers)
      }).catch((error)=>{
        console.log(`Error loading promo offer for ${productId}: ${error}`)
        additionalEvents$.next([])
      })
    }

    // Prepare output
    let output$ = merge(this.promoOffers$[productId], additionalEvents$)
    output$ = output$.pipe(filter((data)=>data !== null)) // DON'T FILTER EMPTY DATA FROM HERE
    return output$
  }

  private groupAndroidSubscriptionOffers(products: Product[]):Product[]{
    let dict = {}
    products.forEach(product => {
      if(!dict.hasOwnProperty(product.id)){
        dict[product.id] = {
          displayPrice: null, // Typically (à partir de ...) based on the available offers
          displayName: product.displayName,
          description: product.description,
          id: product.id,
          offers: [],
          firstPhaseMonthlyPrices: []
        }
      }
      dict[product.id].offers.push({
        displayPrice: product.displayPrice,
        price: product.price,
        androidOfferToken: product.androidOfferToken,
        pricingPhases: product.pricingPhases
      })
      let firstPhaseBillingPeriod = product.pricingPhases[0].billingPeriod // 'P1M', 'P3M', 'P6M', 'P1Y'
      let firstPhaseBillingNMonth = this.billingPeriodToMonth(firstPhaseBillingPeriod)
      let firstPhasePrice = product.pricingPhases[0].priceAmountMicros / 1000000
      dict[product.id].firstPhaseMonthlyPrices.push(firstPhasePrice / firstPhaseBillingNMonth)
    })
    // Compute the display price
    for (let key in dict){
      let product = dict[key]
      if (product.offers.length == 1){
        dict[key].displayPrice = `${product.offers[0].displayPrice}/mois`
      }else{
        let minPrice = Math.min(...product.firstPhaseMonthlyPrices)
        minPrice = (Math.round(minPrice * 100) / 100)
        let minPriceStr = `À partir de ${this.patchDisplayPrice(product.offers[0].displayPrice, minPrice)}/mois`
        dict[key].displayPrice = minPriceStr
      }
    }
    // Convert dictionary to array
    let output = []
    for (let key in dict)
      output.push(dict[key])
    return output
  }

  private billingPeriodToMonth(billingPeriod:string):number{
    let dict = {
      'P1M': 1,
      'P3M': 3,
      'P6M': 6,
      'P1Y': 12
    }
    return dict[billingPeriod]
  }

  private extractCurrency(displayPrice:string):string{
    return displayPrice.replace(/[0-9.,\s]/g, '');
  }

  private patchDisplayPrice(templateDisplayPrice: string, value: number):string{
    // Find the numeric part (digits, comma, or period)
    const match = templateDisplayPrice.match(/[\d.,]+/);
    if (!match) {
      // Fallback: if no number is found, append the value.
      return templateDisplayPrice + value;
    }

    const originalNumber = match[0];
    let newNumberStr = "";
    
    // Check if the original number has a decimal point or comma
    if (originalNumber.includes('.') || originalNumber.includes(',')) {
      // Determine the separator ('.' is more common, but some locales use ',')
      const separator = originalNumber.includes('.') ? '.' : ',';
      const parts = originalNumber.split(separator);
      // Use the number of decimals in the original for formatting
      const decimals = parts[1] ? parts[1].length : 0;
      newNumberStr = value.toFixed(decimals);
      // If the original separator was a comma, replace the decimal point in our new string
      if (separator === ',') {
        newNumberStr = newNumberStr.replace('.', ',');
      }
    } else {
      // No decimal, so use an integer representation (or you could opt to use value.toString())
      newNumberStr = Math.round(value).toString();
    }
    
    // Replace the found numeric part with the newly formatted value
    return templateDisplayPrice.replace(originalNumber, newNumberStr);
  }

  private computeIOSMonthlyPrice(offer:PromoOfferIOS):number{
    let price = offer.price
    let periodUnit = offer.periodUnit
    let periodUnitNDays = {
      "Jour": 1,
      "Day": 1,
      "Semaine": 7,
      "Week": 7,
      "Mois": 30,
      "Month": 30,
      "An": 365,
      "Year": 365
    }
    let periodNDays = periodUnitNDays[periodUnit]
    let monthlyPrice = price / (offer.periodValue * periodNDays / 30)
    return monthlyPrice
  }
}
