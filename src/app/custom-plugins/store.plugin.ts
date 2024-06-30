import { registerPlugin } from '@capacitor/core'

export interface StorePlugin {
  getProducts(options: { }): Promise<{ value: any[]}>
}
const Store = registerPlugin<StorePlugin>('Store');
export default Store;