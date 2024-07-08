import {Capacitor, registerPlugin} from '@capacitor/core'
const mockStorePlugin: StorePlugin = {
  getProducts: async() => {
    return {
      "products":[
        {"description":"Personal Trainer (1 Séance)","displayName":"Personal Trainer (1 Séance)","price":49.99,"id":"trainer1", "displayPrice": "49.99 €"},
        {"displayName":"Personal Trainer (5 séances)","id":"trainer5","price":249.99,"description":"Personal Trainer (5 séances)", "displayPrice": "249.99 €"},
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
        inAppOwnershipType: "PURCHASED"
      }
    }
  }
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  purchaseProductById(options: { productId: string }): Promise<{ success: boolean, transaction: Transaction }>
}
export interface Transaction {
  bundleId: string;
  deviceVerificationNonce: string;
  quantity: number;
  transactionId: number;
  signedDate: string;
  deviceVerification: string;
  inAppOwnershipType: string;
}

let Store: StorePlugin;
if (Capacitor.isNativePlatform()) {
  Store = registerPlugin<StorePlugin>('Store');
} else {
  Store = mockStorePlugin;
}
export default Store;