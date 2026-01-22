import { signal } from "@angular/core";
import { AndroidOffer, AndroidStoreProduct } from "./abstract-purchase-invoice";
import { AbstractStoreProductUiAdapter, DisplayableProduct } from "./abstract-store-product-ui-adapter";

export class AndroidStoreProductUIAdapter extends AbstractStoreProductUiAdapter<AndroidStoreProduct> {
  private baseOffer: AndroidOffer;

  constructor(androidStoreProduct: AndroidStoreProduct) {
    super(androidStoreProduct);

    console.log("product", androidStoreProduct);

    // Identify base offer (the one with only 1 pricingPhase)
    this.baseOffer = androidStoreProduct.offers.find(offer => offer.pricingPhases.length === 1) || androidStoreProduct.offers[0];

    // Map offers to displayables
    this._displayables = signal(androidStoreProduct.offers.map(offer => {
        const firstPhase = offer.pricingPhases[0];
        const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);

        const durationText = this._getDurationText(billingNMonth);
        const displayPrice = offer.displayPrice;
        const isMonthlyPrice = billingNMonth === 1;
        const weeklyPrice = this._computeWeeklyPrice(offer);
        const monthlyPrice = this._computeMonthlyPrice(offer);
        const isFree = offer.price === 0;
        const normalPrice = this._computeNormalPrice(offer);
        const percentageReduction = firstPhase.percentageReduction || 0;

        return {
          durationText,
          displayPrice,
          isMonthlyPrice,
          weeklyPrice,
          monthlyPrice,
          isFree,
          normalPrice,
          percentageReduction
        } as DisplayableProduct;
    }).sort((a, b) => a.percentageReduction - b.percentageReduction));
  }

  private _parseBillingPeriodToMonths(billingPeriod: string): number {
    const periodMap: {[key: string]: number} = {
      "P1M": 1,
      "P3M": 3,
      "P6M": 6,
      "P1Y": 12
    };
    return periodMap[billingPeriod] || 1;
  }

  private _getDurationText(nMonths: number): string {
    const durationMap: {[key: number]: string} = {
      1: "Mensuel",
      3: "3 mois",
      6: "6 mois",
      12: "Annuel"
    };
    return durationMap[nMonths] || `${nMonths} mois`;
  }

  private _applyCurrencyWithRef(price: number, formattedPriceReference: string): string {
    const currency = this._extractCurrency(formattedPriceReference);
    return this._applyCurrency(price, currency);
  }

  private _computeWeeklyPrice(offer: AndroidOffer): string {
    const firstPhase = offer.pricingPhases[0];
    const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);
    const weeklyPrice = offer.price / (billingNMonth * 4.33);
    return this._applyCurrencyWithRef(weeklyPrice, firstPhase.formattedPrice);
  }

  private _computeMonthlyPrice(offer: AndroidOffer): string | undefined {
    const firstPhase = offer.pricingPhases[0];
    const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);

    if (billingNMonth === 1) {
      return undefined;
    }

    const monthlyPrice = offer.price / billingNMonth;
    return this._applyCurrencyWithRef(monthlyPrice, firstPhase.formattedPrice);
  }

  private _computeNormalPrice(offer: AndroidOffer): string {
    const firstPhase = offer.pricingPhases[0];
    const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);

    // If it's the base offer or monthly, no normal price
    if (offer === this.baseOffer || billingNMonth === 1) {
      return '';
    }

    // Calculate what the price would be without discount
    const baseMonthlyPrice = this.baseOffer.price;
    const normalPrice = baseMonthlyPrice * billingNMonth;

    return this._applyCurrencyWithRef(normalPrice, firstPhase.formattedPrice);
  }

}