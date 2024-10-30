import {Capacitor, registerPlugin} from '@capacitor/core'
const mockStorePlugin: StorePlugin = {
  getProducts: async() => {
    return {
      "products":[
        /*{"displayPrice":"$249.99","description":"Personal Trainer (5 sessions)","displayName":"Personal Trainer (5 sessions)","id":"trainer5","price":249.99},
        {"displayName":"Personal Trainer (1 session)","displayPrice":"$49.99","description":"Personal Trainer (1 session)","price":49.99,"id":"trainer1"},
        {"displayPrice":"$17.99","description":"Food Coaching (1 Month)","id":"foodcoach_1w","displayName":"Food Coaching (1 Month)","price":17.99}*/
        {"description":"Sport Coaching (1 Week)","id":"sportcoach_1w","price":24.99,"displayPrice":"$24.99","displayName":"Sport Coaching (1 Week)"},
        {"description":"Personal Trainer (5 sessions)","displayPrice":"$249.99","id":"trainer5","price":249.99,"displayName":"Personal Trainer (5 sessions)"},
        {"price":12.99,"displayPrice":"$12.99","displayName":"Pack Hoylt","description":"Pack Hoylt","id":"hoylt"},
        {"displayName":"Personal Trainer (1 session)","description":"Personal Trainer (1 session)","displayPrice":"$49.99","price":49.99,"id":"trainer1"},
        
        {"displayName":"Food Coaching (1 Month)","description":"Food Coaching (1 Month)","price":17.99,"displayPrice":"$17.99","id":"foodcoach_4w"}
      ]
    }
  },
  purchaseProductById: async(options: { productId: string }) => {
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

  }
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  purchaseProductById(options: { productId: string }): Promise<{ success: boolean, transaction: Transaction }>
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


let Store: StorePlugin;
if (Capacitor.isNativePlatform()) {
  Store = registerPlugin<StorePlugin>('Store');
} else {
  Store = mockStorePlugin;
}
export default Store;