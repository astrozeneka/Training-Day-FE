import {Capacitor, registerPlugin} from '@capacitor/core'
const mockStorePlugin: StorePlugin = {
  getProducts: async(options: {type:'subs'|'inapp'|null}) => { // Type is only for android
    if (Store.emulatedOS == 'ios'){
      return {
        "products":[
          {"price":12.99,"id":"foodcoach_1w","displayName":"Food Coaching (1 Month)","displayPrice":"$12.99","description":"Get 1 month of food coaching program"},{"id":"sportcoach_6w","displayPrice":"$49.99","price":49.99,"description":"Get 6 weeks of sport coaching program","displayName":"Sport Coaching (6 Weeks)"},{"description":"Get 1 week of sport coaching program","displayName":"Sport Coaching (1 Week)","price":12.99,"displayPrice":"$12.99","id":"sportcoach_1w"},{"displayName":"Food Coaching (1 Month)","price":44.99,"id":"foodcoach_4w","displayPrice":"$44.99","description":"Get 1 month of food coaching program"},{"description":"Get 5 training sessions.","id":"trainer5","displayName":"Personal Trainer (5 sessions)","displayPrice":"$249.00","price":249},{"id":"sportcoach_4w","description":"Get 1 month of sport coaching program","displayPrice":"$44.99","displayName":"Sport Coaching (1 Month)","price":44.99},{"displayName":"Pack Alonzo","description":"Get Alonzo subscription","id":"alonzo","price":44.99,"displayPrice":"$44.99"},{"displayPrice":"$449.00","description":"Get 10 training sessions.","price":449,"id":"trainermax","displayName":"Personal Trainer (10 sessions)"},{"description":"Get Hoylt subscription","price":6.99,"id":"hoylt","displayName":"Pack Hoylt","displayPrice":"$6.99"},{"price":24.99,"displayPrice":"$24.99","displayName":"Pack Gursky","description":"Get Gursky subscription","id":"gursky"},{"price":22.99,"displayName":"Pack Moreno","description":"Get Moreno subscription","displayPrice":"$22.99","id":"moreno"},{"id":"trainer1","displayName":"Personal Trainer (1 session)","description":"Get one training session.","displayPrice":"$49.99","price":49.99},{"id":"smiley","description":"Get Smiley subscription","price":24.99,"displayName":"Pack Smiley","displayPrice":"$24.99"},{"displayName":"Food Coaching (6 Weeks)","price":49.99,"id":"foodcoach_6w","description":"Get 6 weeks of food coaching program","displayPrice":"$49.99"}]
      }
    } else if (Store.emulatedOS == 'android'){
      if (options.type == 'inapp' || options.type == null){
        return {"products": [
          {
              "productId": "foodcoach__30d",
              "type": "inapp",
              "title": "Programme Alimentaire (1 Mois) (Training-Day)",
              "name": "Programme Alimentaire (1 Mois)",
              "description": "Un programme alimentaire mensuel",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 44990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "44,99 $US"
              }
          },
          {
              "productId": "foodcoach__45d",
              "type": "inapp",
              "title": "Programme Alimentaire (6 Semaines) (Training-Day)",
              "name": "Programme Alimentaire (6 Semaines)",
              "description": "Un programme alimentaire pour 6 semaines",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 54990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "54,99 $US"
              }
          },
          {
              "productId": "foodcoach__7d",
              "type": "inapp",
              "title": "Programme Alimentaire (7 Jours) (Training-Day)",
              "name": "Programme Alimentaire (7 Jours)",
              "description": "Un programme alimentaire hebdomadaire",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 12990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "12,99 $US"
              }
          },
          {
              "productId": "sportcoach__30d",
              "type": "inapp",
              "title": "Programme Sportif (1 Mois) (Training-Day)",
              "name": "Programme Sportif (1 Mois)",
              "description": "Programme sportif mensuel",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 44990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "44,99 $US"
              }
          },
          {
              "productId": "sportcoach__45d",
              "type": "inapp",
              "title": "Programme Sportif (6 Semaines) (Training-Day)",
              "name": "Programme Sportif (6 Semaines)",
              "description": "Un programme sportif pour 6 semaines",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 54990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "54,99 $US"
              }
          },
          {
              "productId": "sportcoach__7d",
              "type": "inapp",
              "title": "Programme Sportif (7 Jours) (Training-Day)",
              "name": "Programme Sportif (7 Jours)",
              "description": "Un programme sportif hebdomadaire",
              "oneTimePurchaseOfferDetails": {
                  "priceAmountMicros": 12990000,
                  "priceCurrencyCode": "USD",
                  "formattedPrice": "12,99 $US"
              }
          }
        ]}
      } else if (options.type == 'subs'){
        return {products: [
          {
              "productId": "training_day",
              "type": "subs",
              "title": "Abonnement Training Day (Training-Day)",
              "name": "Abonnement Training Day",
              "description": "",
              "subscriptionOfferDetails": [
                  {
                      "basePlanId": "hoylt",
                      "offerIdToken": "Afjq3G9u8w3rdHzDd7en+FMV3Hmu1SopbCMeX9l0/Y1wINgfoOb47FMTUonoAK0rp7980d0gyxIZHBw=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 10990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "10,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "basePlanId": "moreno",
                      "offerIdToken": "Afjq3G9LD6I21UPcY7zejcKIe+fvmI8oMJieaO+NeONlit5O2mZXF3r8RxYNUpnC8oFX8WBSsmkBxxg=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 31990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "31,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "basePlanId": "alonzo",
                      "offerIdToken": "Afjq3G8wdc+JqxUi/lJ6xvg1X2sp2CIJr133uDj8fSnqNpAsr5OVxXl0pgrctaSbFRuzu2f9TeRqmuM=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 49990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "49,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  }
              ]
          }
        ]}
      } else {
        console.log(options.type)
        return {products: []}
      }
    } else {
      return {products: []}
    }
  },
  emulatedPurchaseBehavior: 'alwaysAllow',
  emulatedOS: 'android',
  purchaseProductById: async(options: { productId: string, type: string|undefined}, os) => {
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        let uid = Math.floor(Math.random() * 1000000);
        if (os == 'ios'){
          if (Store.emulatedPurchaseBehavior == 'alwaysAllow'){
            resolve({
              success: true,
              transaction: {
                // The product_id is not included in the transaction for iOS
                bundleId: "com.codecrane.trainingday",
                deviceVerification: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx${uid}`,
                deviceVerificationNonce: `XXXXXX-XXXX-XXXX-XXX-${uid}`,
                quantity: 1,
                transactionId: 1,
                signedDate: (new Date()).toISOString(),
                inAppOwnershipType: "PURCHASED",
                id: undefined, // TransactionId: 2000000730775813
                environment: 'fake' // Environment: "Sandbox" or "Xcode"
              }
            })
          } else if (Store.emulatedPurchaseBehavior == 'alwaysDisallow'){
            reject({message: "Transaction annulée par l'utilisateur [Emulation]"})
          }
        } else if (os == 'android'){
          if (Store.emulatedPurchaseBehavior == 'alwaysAllow'){
            Store.webListeners['onPurchase']?.(
              {
                "purchases":[
                  {
                    "orderId":`GPA.XXXX-XXXX-XXXX-${uid}`,
                    "packageName":"com.trainingday",
                    "purchaseTime":(new Date()).getTime(),
                    "purchaseState":1,
                    "purchaseToken":`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx${uid}`,
                    "quantity":1,
                    "acknowledged":false
                  }
                ]
              }
            );
          }
        }
      }, 1000)
    })
  },
  addListener: (eventName: string, listenerFunc: Function) => {
  },
  getPurchasedNonRenewable: async() => {
    return {products: []}
  },
  getNonRenewableEntitlements: async() => {
    return {
      "entitlements": [
        /*{
          "deviceVerification":"DqnyVPZHelalgo4cuKhPjhzJL3X1b/h1m/0Ou7I5TLp+RP0R7P/4jWT3mEcO2Hjf",
          "inAppOwnershipType":"PURCHASED",
          "bundleId":"com.codecrane.training-day",
          "deviceVerificationNonce":"385028E3-0111-43C9-B2BC-23AE749434F9",
          "transactionId":7,
          "signedDate":"2024-07-13T16:33:10Z",
          "quantity":1
        }*/
        {
          "inAppOwnershipType":"PURCHASED",
          "signedDate":"2024-07-14T06:53:47Z",
          "bundleId":"com.codecrane.training-day",
          "quantity":1,
          "transactionId":8,
          "deviceVerificationNonce":"327557D6-32F6-4813-BC43-984D071B9A30",
          "deviceVerification":"YdmaWuQLg9b2vMlBmEPqJzZIa6lj5B5tyz0lLo1yMDuZ95RGOs8ZRHO1YKwFzJ9k",
          id: undefined,
          environment: undefined
        }
      ],
      "subscriptions": []
    }
  },
  getAutoRenewableEntitlements: async() => {
    return {
      "entitlements": [
        // Hoylt for ryanrasoarahona@gmail.com
        //{"signedDate":"2024-07-21T11:14:31Z","transactionId":14,"bundleId":"com.codecrane.training-day","deviceVerification":"3qH6g6BLdhxEHk4DtO7XpHHSY32buyobXLzZ9cwe8j1WLzU0YwNUGVepQicOWv8H","deviceVerificationNonce":"168F4790-4B95-4585-89FF-D35CE8773CFD","inAppOwnershipType":"PURCHASED","quantity":1}
      ],
      "subscriptions": [
        //{"displayName":"Pack Hoylt","description":"Pack Hoylt","id":"hoylt","displayPrice":"$12.99","price":12.99}
      ]
    }
  },
  present: async(options: {message: String }) => {
    return {success: true}

  },
  // Experimental feature for Android
  getAndroidEntitlements: async() => {
    return {"entitlements":[{"packageName":"com.trainingday","purchaseTime":1732789251193,"purchaseState":1,"purchaseToken":"mlinpdiflmgpemccnllgbpkl.AO-J1OxoPCHef6-iN_UNBTYPvzAHMylBJlnyaMW40UgUeijrPv1DRGc-wxgwJakAFUCOPsgsT_W-QnaR7i4VIcV44VX9_mb-lQ","quantity":1,"acknowledged":true,"products":["foodcoach__30d"]},{"packageName":"com.trainingday","purchaseTime":1732787580811,"purchaseState":1,"purchaseToken":"bdobnfafbkkopgohhpjoflpk.AO-J1OyGu9SbTYmqBDacHAmPZIXvtcHHZtBEMZaCve9Nwpfn9HLfem9E4n4q-Nf814k6GQCWX5NWm4JMAlTYwneUK2JTol822Q","quantity":1,"acknowledged":true,"products":["foodcoach__7d"]},{"packageName":"com.trainingday","purchaseTime":1732788637537,"purchaseState":1,"purchaseToken":"jgbaniplfdffldemoeaphojd.AO-J1Oz8wpDkPmxx5xIVmQrwqTKhyxYsM2Mqa1EHhHxoPrXcA_msmjE32fKtv-cvYt5TnfD05_7YlHowVz8bJX2kF4B2Ngo8zw","quantity":1,"acknowledged":true,"products":["sportcoach__7d"]}]} as any
  },

  // Redeem code (for ios)
  presentRedeemCodeSheet(){
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1300);
    })
  },
  // Redeem code (for android)
  openAndroidPromoDeepLink: (options: {url: String}) => {
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve({message: "Fakely presented"})
      }, 1300);
    })
  },
  // (Experimental) Consume product
  forceAndroidConsumeProduct: (options: {purchaseToken: String}) => {
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve({message: "Fakely consumed"})
      }, 1300);
    })
  },
  webListeners: {}
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  emulatedPurchaseBehavior: 'alwaysAllow'|'alwaysDisallow' // Used for testing only
  emulatedOS: 'ios'|'android' // Used for testing only
  purchaseProductById(options: { productId: string, type: string|undefined, offerToken?: string|undefined}, os?): Promise<{ success: boolean, transaction: Transaction }>
  addListener(eventName: string, listenerFunc: Function): void; // @deprecated
  getPurchasedNonRenewable(options: { }): Promise<{ products: any[] }>, // @deprecated

  getNonRenewableEntitlements(options: { }): Promise<{
    entitlements: Transaction[],
    subscriptions: Product[]
  }> // Entitlements is same a previousl Transaction
  getAutoRenewableEntitlements(options: { }): Promise<{
    entitlements: Transaction[],
    subscriptions: Product[]
  }>

  // Experimental features
  present(options: {message: String }): Promise<{ success: boolean }>
  getAndroidEntitlements(): Promise<{ entitlements: Transaction[] }>

  // The redeem code sheet (in iOS)
  presentRedeemCodeSheet(): Promise<{ success: boolean }>; // Might be updated later

  // The redeem code sheet (in Android)
  openAndroidPromoDeepLink(options: {url: String}): Promise<{ message: string }>; // Might be updated later

  // (Experimental) Consume product
  forceAndroidConsumeProduct(options: {purchaseToken: String}): Promise<{ message: string }>

  // A crucial item for testing
  webListeners: {[key: string]: Function}
}
export interface Transaction {
  bundleId: string;
  deviceVerificationNonce: string;
  quantity: number;
  transactionId: number;
  signedDate: string;
  deviceVerification: string;
  inAppOwnershipType: string;

  id: any | undefined; // This value is what we want to track
  environment: any | undefined; // This value is what we want to track
}
export interface Product {
  displayPrice: string;
  description: string;
  displayName: string;
  id: string;
  price: number;
  androidOfferToken?: string | undefined; // Only for Android
}


// The Android IAP product
export interface AndroidProduct {
  productId: string
  type: string
  title: string
  name: string
  description: string
  oneTimePurchaseOfferDetails: AndroidOneTimePurchaseOfferDetails
}
export interface AndroidOneTimePurchaseOfferDetails {
  priceAmountMicros: number
  priceCurrencyCode: string
  formattedPrice: string
}
/**
 * @deprecated use AndroidEntitlement instead
 */
export interface AndroidEntitlements {
  orderId: string
  packageName: string
  productId: string
  purchaseTime: number
  purchaseState: number
  purchaseToken: string
  quantity: number
  acknowledged: boolean
}
export interface AndroidEntitlement {
  packageName: string
  purchaseTime: number
  purchaseState: number
  purchaseToken: string
  quantity: number
  acknowledged: boolean
  products: string[]
}

// The Android IAP product
export interface AndroidSubscription {
  productId: string
  type: string
  title: string
  name: string
  localizedIn: string[]
  skuDetailsToken: string
  subscriptionOfferDetails: SubscriptionOfferDetail[]

  // Experimental for the new subscription data structure
  androidOfferToken?: string | undefined; // Only for Android
}
export interface SubscriptionOfferDetail {
  offerIdToken: string
  basePlanId: string
  pricingPhases: PricingPhase[]
  offerTags: any[]
}
export interface PricingPhase {
  priceAmountMicros: number
  priceCurrencyCode: string
  formattedPrice: string
  billingPeriod: string
  recurrenceMode: number
}


let Store: StorePlugin;
if (Capacitor.isNativePlatform()) {
  Store = registerPlugin<StorePlugin>('Store');
} else {
  Store = mockStorePlugin;
  Store.webListeners = {}
  Store.addListener = (eventName: string, listenerFunc: Function) => {
    Store.webListeners[eventName] = listenerFunc;
  }
  (window as any).StorePlugin = Store;
}

export type StorePluginEvent = 'onPurchase'|'onPurchaseAborted'
export default Store;