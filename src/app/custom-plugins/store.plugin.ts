import {Capacitor, registerPlugin} from '@capacitor/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
const mockStorePlugin: StorePlugin = {
  getProducts: async(options: {type:'subs'|'inapp'|null}) => { // Type is only for android
    if (mockStorePlugin._emulatedOSData == 'ios'){
      return {
        "products":[{"displayPrice":"269,00 €","price":269,"description":"Bénéficiez de 5 séances d'entraînement.","id":"trainer5","displayName":"Personal Trainer (5 séances)"},{"displayPrice":"29,99 €","id":"gursky","description":"Profitez de l'abonnement Gursky","displayName":"Pack Gursky","price":29.99},{"displayName":"Personal Trainer (1 Séance)","description":"Bénéficiez d'une séance d'entraînement.","id":"trainer1","price":59.99,"displayPrice":"59,99 €"},{"description":"Profitez d'une semaine de coaching","id":"foodcoach_1w","price":14.99,"displayPrice":"14,99 €","displayName":"Programme Alimentaire Hebdo."},{"displayName":"Personal Trainer (10 séances)","price":499,"displayPrice":"499,00 €","id":"trainermax","description":"Bénéficiez de 10 séances d'entraînement."},{"price":49.99,"id":"alonzo","displayName":"Pack Alonzo","description":"Profitez de l'abonnement Alonzo","displayPrice":"49,99 €"},{"id":"sportcoach_6w","displayPrice":"59,99 €","description":"Profitez de 6 semaines de programme sportif","displayName":"Programme Sportif 6 Semaines","price":59.99},{"displayName":"Programme Alimentaire Mensuel","description":"Profitez d'un mois de coaching","displayPrice":"49,99 €","price":49.99,"id":"foodcoach_4w"},{"description":"Profitez de l'abonnement Moreno","id":"moreno","displayName":"Pack Moreno","displayPrice":"34,99 €","price":34.99},{"price":14.99,"id":"sportcoach_1w","displayName":"Programme Sportif Hebdo.","description":"Profitez d'une semaine de programme sportif","displayPrice":"14,99 €"},{"price":29.99,"description":"Profitez de l'abonnement Smiley","id":"smiley","displayPrice":"29,99 €","displayName":"Pack Smiley"},{"displayName":"Programme Alimentaire 6 Sem.","description":"Profitez de 6 semaines de coaching","id":"foodcoach_6w","displayPrice":"59,99 €","price":59.99},{"description":"Profitez d'un mois de programme sportif","displayPrice":"49,99 €","id":"sportcoach_4w","displayName":"Programme Sportif Mensuel","price":49.99},{"id":"hoylt","displayName":"Pack Hoylt","description":"Profitez de l'abonnement Hoylt","displayPrice":"9,99 €","price":9.99}]
      }
    } else if (mockStorePlugin._emulatedOSData == 'android'){
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
        /* // used with billingclient v6.0.0 (doesn't support promotional offer)
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
        */
        // used with billingclient v7.1.1
        return {"products": [
          {
              "productId": "training_day",
              "type": "subs",
              "title": "Abonnement Training Day (Training-Day)",
              "name": "Abonnement Training Day",
              "description": "",
              "subscriptionOfferDetails": [
                  {
                      "basePlanId": "hoylt",
                      "offerIdToken": "AWOstcaBzLJgZ/sGxvCEUPcGIy0MYFoJd4+P9PKwk0ra8KC++LRETRYnCyR5VKo5XnPVrBh/MyLTK9g=",
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
                      "offerIdToken": "AWOstcaDpbzc2cFk9GVsOl9XMeKArfx4dPokr3OE0EcFkezr4BtzUfWiiAaO6H2DIOGsAsxs0ZTivtE=",
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
                      "offerId": "gursky6mo",
                      "basePlanId": "gursky",
                      "offerIdToken": "AWOstcZSPA4KbkCuaPde0LQyYGzzHPojnOtx+FAdhKiS5cy3Zn9d6qQYZvIKRTGjf2i30j79WByKGLq1PmqVJA==",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 144990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "144,99 $US",
                              "billingPeriod": "P6M",
                              "recurrenceMode": 2,
                              "billingCycleCount": 1
                          },
                          {
                              "priceAmountMicros": 25990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "25,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "basePlanId": "gursky",
                      "offerIdToken": "AWOstcZGi+Xre/XLjQGX9Wj5EcaKCCDUd/NgCCVnXwoLiVMoHu7CQFiwqRmv20TduXM222GyKCnydso=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 25990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "25,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "basePlanId": "smiley",
                      "offerIdToken": "AWOstcakwSo1WBFIy8NPWhEsFJxZT7Nez67hpZMhKmFbS8qLrHJHv9pjc682bGPDZmbJ8Djfj4ISdmY=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 25990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "25,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "offerId": "alonzoupgrade",
                      "basePlanId": "alonzo",
                      "offerIdToken": "AWOstcbou8VdTyxeG8hhqQPn+Rh9xiFyx12iWGe3BWstcft6jWD01sNqFkT1JGkFaoxFOT25JVQhAHwJwFbzFWFwlwQ9fa0=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 41790000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "41,79 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 2,
                              "billingCycleCount": 2
                          },
                          {
                              "priceAmountMicros": 43990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "43,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "offerId": "alonzofree",
                      "basePlanId": "alonzo",
                      "offerIdToken": "AWOstcZP9oCgr1paRcye7YNH9oH+zwY7ezUDDFm2UVcHnQLq34PBALq90cbmGBk82rhkiCWiXzNYlStPONMyQTouDQ==",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 0,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "Gratuit",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 2,
                              "billingCycleCount": 1
                          },
                          {
                              "priceAmountMicros": 43990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "43,99 $US",
                              "billingPeriod": "P1M",
                              "recurrenceMode": 1,
                              "billingCycleCount": 0
                          }
                      ]
                  },
                  {
                      "basePlanId": "alonzo",
                      "offerIdToken": "AWOstcZjHPysUCUewzeHLkIgbMRMJdj7r9nZAZ14IMUT1e5nhD/IZJpcnX3AE7fJd8ofHCA4ro4EorQ=",
                      "offerTags": [],
                      "pricingPhases": [
                          {
                              "priceAmountMicros": 43990000,
                              "priceCurrencyCode": "USD",
                              "formattedPrice": "43,99 $US",
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

  // Emulation purchase behavior
  _emulatedPurchaseBehaviorData: 'alwaysAllow',
  _emulatedPurchaseBehavior$: new BehaviorSubject<'alwaysAllow'|'alwaysDisallow'>('alwaysAllow'),
  onEmulatedPurchaseBehavior: () => {
    return mockStorePlugin._emulatedPurchaseBehavior$.asObservable();
  },
  setEmulatedPurchaseBehavior: (behavior: 'alwaysAllow'|'alwaysDisallow') => {
    mockStorePlugin._emulatedPurchaseBehaviorData = behavior;
    mockStorePlugin._emulatedPurchaseBehavior$.next(behavior);
  },

  // OS emulation
  _emulatedOSData: 'android',
  _emulatedOSSubject: new BehaviorSubject<'ios'|'android'>('android'),
  onEmulatedOS: () => {
    return mockStorePlugin._emulatedOSSubject.asObservable();
  },
  setEmulatedOS: (os: 'ios'|'android') => {
    mockStorePlugin._emulatedOSData = os;
    mockStorePlugin._emulatedOSSubject.next(os);
  },

  purchaseProductById: async(options: { productId: string, type: string|undefined}, os) => {
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        let uid = Math.floor(Math.random() * 1000000);
        if (os == 'ios'){
          if (Store._emulatedPurchaseBehaviorData == 'alwaysAllow'){
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
          } else if (Store._emulatedPurchaseBehaviorData == 'alwaysDisallow'){
            reject({message: "Transaction annulée par l'utilisateur [Emulation]"})
          }
        } else if (os == 'android'){
          if (Store._emulatedPurchaseBehaviorData == 'alwaysAllow'){
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
          } else if (Store._emulatedPurchaseBehaviorData == 'alwaysDisallow'){
            Store.webListeners['onPurchaseAborted']?.({message: "Transaction annulée par l'utilisateur [Emulation]"})
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
  getAndroidSubscriptionEntitlements: async() => {
    return {"entitlements": []}
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
  acknowledgeAndroidPurchase(options: {purchaseToken: String}){
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve({message: "Fakely acknowledged"})
      }, 1300);
    })
  },
  webListeners: {},
  fetchPromotionalOffer: async(options: { productId: string })=>{
    // Mocking for iOS
    if (options.productId == 'hoylt')
      return {"offers":[{"type":"AdhocOffer","periodCount":1,"periodValue":6,"displayPrice":"$39.99","periodUnit":"Mois","paymentMode":"PayUpFront","price":39.99000000000001,"offerId":"hoylt6mo","productId":"hoylt"}]}
    if (options.productId == 'alonzo')
      return {"offers":[{"periodCount":1,"paymentMode":"PayUpFront","displayPrice":"249,99 €","periodValue":6,"productId":"alonzo","periodUnit":"Mois","type":"AdhocOffer","offerId":"alonzo6mo","price":249.99}]}
    return {"offers": []}
  },
  purchaseProductWithDiscount: async(options: { productId: string, type: string|undefined, offerSignatureInfo: IOSPromoOfferSignatureInfo}, os)=>{
    return {"message": "Hello from web"}
  },
  openAndroidSubscriptionManagementPage: async(options: { productId: string })=>{
    // Fakely return something
    return {"message": "Hello from web"}
  },
  openSafariView: async(options: { url: string })=>{
    // Fakely return something
    return {"message": "Hello from web"}
  }
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  
  // Purchase behavior (used for testing only)
  _emulatedPurchaseBehaviorData: 'alwaysAllow'|'alwaysDisallow' // Used for testing only
  _emulatedPurchaseBehavior$: BehaviorSubject<'alwaysAllow'|'alwaysDisallow'> // Used for testing only
  onEmulatedPurchaseBehavior(): Observable<'alwaysAllow'|'alwaysDisallow'> // Used for testing only
  setEmulatedPurchaseBehavior(behavior: 'alwaysAllow'|'alwaysDisallow'): void // Used for testing only

  // OS emulation (Used for testing only)
  _emulatedOSData: 'ios'|'android' // Used for testing only
  _emulatedOSSubject: BehaviorSubject<'ios'|'android'> // Used for testing only
  onEmulatedOS(): (Observable<'ios'|'android'>), // Used for testing only
  setEmulatedOS(os: 'ios'|'android'): void // Used for testing only


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

  // Android entitlements for inapp purchase adn subscsription
  getAndroidEntitlements(): Promise<{ entitlements: Transaction[] }>
  getAndroidSubscriptionEntitlements(): Promise<{ entitlements: Transaction[] }>

  // The redeem code sheet (in iOS)
  presentRedeemCodeSheet(): Promise<{ success: boolean }>; // Might be updated later

  // The redeem code sheet (in Android)
  openAndroidPromoDeepLink(options: {url: String}): Promise<{ message: string }>; // Might be updated later

  // Consume product (for manual testing)
  forceAndroidConsumeProduct(options: {purchaseToken: String}): Promise<{ message: string }>

  // Acknowledge product
  acknowledgeAndroidPurchase(options: {purchaseToken: String}): Promise<{ message: string }>

  // Registered listener (for testing only)
  webListeners: {[key: string]: Function}

  // fetchPromotionalOffer
  fetchPromotionalOffer: (options: { productId: string })=>Promise<any>

  // Purchase using a promotional offer
  purchaseProductWithDiscount: (options: { productId: string, type: string|undefined, offerSignatureInfo: IOSPromoOfferSignatureInfo}, os)=>Promise<{ message: string }>

  // Open Browser
  openAndroidSubscriptionManagementPage: (options: { productId: string })=>Promise<{ message: string}>

  // Open safari view
  openSafariView: (options: { url: string })=>Promise<{ message: string }>
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
  androidOfferToken?: string | undefined; // Android Subs only
  pricingPhases?: PricingPhase[]; // Android Subs only
  offers?: AndroidSubscriptionOffer[];
  baseOfferDisplayPrice?: string; // Used if offers are available
}

export interface AndroidSubscriptionOffer {
  displayPrice: string;
  pricingPhases?: PricingPhase[];
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

export interface IOSPromoOfferSignatureInfo {
  signature: string
  nonce: string
  timestamp: number
  keyIdentifier: string
}

export interface PromoOfferIOS {
  type: string
  periodCount: number
  periodValue: number
  displayPrice: string
  periodUnit: string
  paymentMode: string
  price: number
  offerId: string
  productId: string
  signatureInfo: IOSPromoOfferSignatureInfo
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