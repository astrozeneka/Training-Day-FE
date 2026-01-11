import { signal } from "@angular/core";
import { AndroidStoreProduct } from "./abstract-purchase-invoice";
import { AbstractStoreProductUiAdapter, DisplayableProduct } from "./abstract-store-product-ui-adapter";

export class AndroidStoreProductUIAdapter extends AbstractStoreProductUiAdapter<AndroidStoreProduct> {
  constructor(androidStoreProduct: AndroidStoreProduct) {
    super(androidStoreProduct);

    // Map offers to displayables
    this._displayables = signal(androidStoreProduct.offers.map(offer => {
        let durationText = { 
            "P1M": "Mensuel",
            "P3M": "Trimestriel",
            "P6M": "Semestriel",
            "P1Y": "Annuel"
        }[offer.pricingPhases[0].billingPeriod];
        const displayPrice = offer.displayPrice;
        const isMonthlyPrice = offer.pricingPhases[0].billingPeriod === "P1M";
         return { 
          durationText,
          displayPrice,
          isMonthlyPrice
        } as DisplayableProduct;
    }))
  }

}