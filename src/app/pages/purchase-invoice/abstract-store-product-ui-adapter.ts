import { AndroidOffer, AndroidStoreProduct, iOSOffer, iOSStoreProduct } from "./abstract-purchase-invoice";
import { signal } from "@angular/core";

export interface DisplayableProduct {
    durationText: string;
    displayPrice: string;
    isMonthlyPrice: boolean;
    weeklyPrice: string;
    monthlyPrice?: string;
    normalPrice: string;
    isFree: boolean;
}

export abstract class AbstractStoreProductUiAdapter<T extends AndroidStoreProduct | iOSStoreProduct> {
    protected _displayables = signal<DisplayableProduct[]>([]);

    constructor(private _product:T) {
    }

    get displayables() {
        if (!this._product)
            throw new Error("Product not set");
        return this._displayables(); 
    }
}