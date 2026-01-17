import { signal } from "@angular/core";
import { AndroidOffer, AndroidStoreProduct } from "./abstract-purchase-invoice";
import { AbstractStoreProductUiAdapter, DisplayableProduct } from "./abstract-store-product-ui-adapter";

export interface Currency {
  symbol: string;
  position: 'prefix' | 'suffix';
  hasSpace: boolean;
  decimalSeparator: string;
  thousandSeparator: string;
}

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
    }))
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

  private _extractCurrency(formattedPrice: string): Currency {
    const numericMatch = formattedPrice.match(/[\d\s.,]+/);
    if (!numericMatch) {
      return {
        symbol: '',
        position: 'suffix',
        hasSpace: false,
        decimalSeparator: '.',
        thousandSeparator: ''
      };
    }

    const numericPart = numericMatch[0];
    const numericIndex = formattedPrice.indexOf(numericPart);

    const prefix = formattedPrice.substring(0, numericIndex).trim();
    const suffix = formattedPrice.substring(numericIndex + numericPart.length).trim();

    const symbol = prefix || suffix;
    const position = prefix ? 'prefix' : 'suffix';
    const hasSpace = prefix
      ? formattedPrice[numericIndex - 1] === ' '
      : formattedPrice[numericIndex + numericPart.length] === ' ';

    const cleanNumeric = numericPart.replace(/\s/g, '');
    const separators = cleanNumeric.match(/[.,]/g) || [];

    let decimalSeparator = '.';
    let thousandSeparator = '';

    if (separators.length > 0) {
      const lastSeparator = cleanNumeric.lastIndexOf(',') > cleanNumeric.lastIndexOf('.') ? ',' : '.';
      const lastSeparatorIndex = cleanNumeric.lastIndexOf(lastSeparator);
      const digitsAfterLast = cleanNumeric.length - lastSeparatorIndex - 1;

      if (digitsAfterLast === 2 || digitsAfterLast === 3) {
        decimalSeparator = lastSeparator;

        if (separators.length > 1) {
          thousandSeparator = lastSeparator === ',' ? '.' : ',';
        }
      } else {
        thousandSeparator = lastSeparator;
        decimalSeparator = lastSeparator === ',' ? '.' : ',';
      }
    }

    return {
      symbol,
      position,
      hasSpace,
      decimalSeparator,
      thousandSeparator
    };
  }

  private _applyCurrency(price: number, formattedPriceReference: string): string {
    const currency = this._extractCurrency(formattedPriceReference);
    const [integerPart, decimalPart = '00'] = price.toFixed(2).split('.');

    let formattedInteger = integerPart;
    if (currency.thousandSeparator && integerPart.length > 3) {
      formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
    }

    const formattedPrice = `${formattedInteger}${currency.decimalSeparator}${decimalPart}`;

    if (currency.position === 'prefix') {
      return `${currency.symbol}${currency.hasSpace ? ' ' : ''}${formattedPrice}`;
    } else {
      return `${formattedPrice}${currency.hasSpace ? ' ' : ''}${currency.symbol}`;
    }
  }

  private _computeWeeklyPrice(offer: AndroidOffer): string {
    const firstPhase = offer.pricingPhases[0];
    const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);
    const weeklyPrice = offer.price / (billingNMonth * 4.33);
    return this._applyCurrency(weeklyPrice, firstPhase.formattedPrice);
  }

  private _computeMonthlyPrice(offer: AndroidOffer): string | undefined {
    const firstPhase = offer.pricingPhases[0];
    const billingNMonth = firstPhase.billingNMonth || this._parseBillingPeriodToMonths(firstPhase.billingPeriod);

    if (billingNMonth === 1) {
      return undefined;
    }

    const monthlyPrice = offer.price / billingNMonth;
    return this._applyCurrency(monthlyPrice, firstPhase.formattedPrice);
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

    return this._applyCurrency(normalPrice, firstPhase.formattedPrice);
  }

}