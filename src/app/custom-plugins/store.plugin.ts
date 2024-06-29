import { registerPlugin } from '@capacitor/core'


export interface StorePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  getProducts(options: { }): Promise<{ value: any[]}>;
  initStore(options: { }): void;
}
const Store = registerPlugin<StorePlugin>('Store')

export default Store;