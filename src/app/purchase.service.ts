import { Injectable } from '@angular/core';
import {InAppPurchase2} from "@ionic-native/in-app-purchase-2/ngx";
import {Platform} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(
    private store: InAppPurchase2,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.setupStore()
    })
  }

  setupStore() {
    this.store.verbosity = this.store.DEBUG;

    // Test: register the pack moreno
    console.log("Setting the store up ...")
    this.store.register({
      id: 'pack_moreno',
      type: this.store.NON_CONSUMABLE
    });

    this.store.when('pack_moreno').approved((product: any) => {
      console.log("Purchase of pack_moreno approved")
      console.log(product)
      product.finish();

      // Provide the content or unlock feature here

    })

    this.store.when('pack_moreno').verified((product: any) => {
      console.log("Purchase of pack_moreno verified") // Doesn't call
    })

    this.store.when('pack_moreno').error((error: any) => {
      console.log("Purchase of pack_moreno error", error) // Doesn't call
    })

    this.store.when('pack_moreno').finished((product: any) => {
      console.log("Purchase of pack_moreno finished") // Doesn't call
      console.log(product)
      const properties = Object.getOwnPropertyNames(product);
      const methods = properties.filter(prop => typeof product[prop] === 'function');
      let appStoreReceipt = product.transaction.appStoreReceipt;
      console.log("App store receipt:", appStoreReceipt);
      // Validate the appStoreReceipt

      console.log("Product methods:", methods);
    });

    this.store.refresh()
  }

  purchase(productId: string){
    console.log("Purchase something")
    this.store.order(productId).then(() => {
      console.log("Purchase in progress ...")
    }).catch((err:any) => {
      console.log("Purchase error: ", err)
    })
  }
}
