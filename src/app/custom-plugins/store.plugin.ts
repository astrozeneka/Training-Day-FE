import {Capacitor, registerPlugin} from '@capacitor/core'
const mockStorePlugin: StorePlugin = {
  getProducts: async() => {
    return {
      "products":[
        {"price":12.99,"id":"foodcoach_1w","displayName":"Food Coaching (1 Month)","displayPrice":"$12.99","description":"Get 1 month of food coaching program"},{"id":"sportcoach_6w","displayPrice":"$49.99","price":49.99,"description":"Get 6 weeks of sport coaching program","displayName":"Sport Coaching (6 Weeks)"},{"description":"Get 1 week of sport coaching program","displayName":"Sport Coaching (1 Week)","price":12.99,"displayPrice":"$12.99","id":"sportcoach_1w"},{"displayName":"Food Coaching (1 Month)","price":44.99,"id":"foodcoach_4w","displayPrice":"$44.99","description":"Get 1 month of food coaching program"},{"description":"Get 5 training sessions.","id":"trainer5","displayName":"Personal Trainer (5 sessions)","displayPrice":"$249.00","price":249},{"id":"sportcoach_4w","description":"Get 1 month of sport coaching program","displayPrice":"$44.99","displayName":"Sport Coaching (1 Month)","price":44.99},{"displayName":"Pack Alonzo","description":"Get Alonzo subscription","id":"alonzo","price":44.99,"displayPrice":"$44.99"},{"displayPrice":"$449.00","description":"Get 10 training sessions.","price":449,"id":"trainermax","displayName":"Personal Trainer (10 sessions)"},{"description":"Get Hoylt subscription","price":6.99,"id":"hoylt","displayName":"Pack Hoylt","displayPrice":"$6.99"},{"price":24.99,"displayPrice":"$24.99","displayName":"Pack Gursky","description":"Get Gursky subscription","id":"gursky"},{"price":22.99,"displayName":"Pack Moreno","description":"Get Moreno subscription","displayPrice":"$22.99","id":"moreno"},{"id":"trainer1","displayName":"Personal Trainer (1 session)","description":"Get one training session.","displayPrice":"$49.99","price":49.99},{"id":"smiley","description":"Get Smiley subscription","price":24.99,"displayName":"Pack Smiley","displayPrice":"$24.99"},{"displayName":"Food Coaching (6 Weeks)","price":49.99,"id":"foodcoach_6w","description":"Get 6 weeks of food coaching program","displayPrice":"$49.99"}]
      
    }
  },
  purchaseProductById: async(options: { productId: string, type: string|undefined }) => {
    return {
      success: true,
      transaction: {
        bundleId: "com.codecrane.trainingday",
        deviceVerification: "7y5pfMkpenu2tSLQxnSk9MmCRUHQOcX6u1LNgwzOr4UbXXd/b5ERZ+LPAKFKneqm",
        deviceVerificationNonce: "11BEBBF1-DD64-4F8E-A335-3D1C9F8E5FF5",
        quantity: 1,
        transactionId: 1,
        signedDate: "2021-07-09T17:00:00Z",
        inAppOwnershipType: "PURCHASED",
        id: undefined, // TransactionId: 2000000730775813
        environment: undefined // Environment: "Sandbox" or "Xcode"
      }
    }
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
    return {
      "entitlements": []
    }
  },

  // Redeem code
  presentRedeemCodeSheet(){
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1300);
    })
  }
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  purchaseProductById(options: { productId: string, type: string|undefined, offerToken?: string|undefined}): Promise<{ success: boolean, transaction: Transaction }>
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

  // The redeem code sheet (in Android) (merged with the above function)
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

// The Android IAP product
export interface AndroidSubscription {
  productId: string
  type: string
  title: string
  name: string
  localizedIn: string[]
  skuDetailsToken: string
  subscriptionOfferDetails: SubscriptionOfferDetail[]
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
}
export default Store;