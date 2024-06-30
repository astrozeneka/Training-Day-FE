import {Capacitor, registerPlugin} from '@capacitor/core'
const mockStorePlugin: StorePlugin = {
  getProducts: async() => {
    return {
      "products":[
        {"description":"Personal Trainer (1 Séance)","displayName":"Personal Trainer (1 Séance)","price":49.99,"id":"trainer1"},
        {"displayName":"Personal Trainer (5 séances)","id":"trainer5","price":249.99,"description":"Personal Trainer (5 séances)"}
      ]
    }
  },
  purchaseProductById: async(options: { productId: string }) => {
    return {
      success: true
    }
  }
}
export interface StorePlugin {
  getProducts(options: { }): Promise<{ products: any[]}>
  purchaseProductById(options: { productId: string }): Promise<{ success: boolean }>
}
let Store: StorePlugin;
if (Capacitor.isNativePlatform()) {
  Store = registerPlugin<StorePlugin>('Store');
} else {
  Store = mockStorePlugin;
}
export default Store;