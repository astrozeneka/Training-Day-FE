import { signal } from "@angular/core";
import { iOSOffer, iOSStoreProduct } from "./abstract-purchase-invoice";
import { AbstractStoreProductUiAdapter, DisplayableProduct } from "./abstract-store-product-ui-adapter";

export class iOSStoreProductUIAdapter extends AbstractStoreProductUiAdapter<iOSStoreProduct> {
  constructor(iOSStoreProduct: iOSStoreProduct) {
    super(iOSStoreProduct);

    const baseOffer: iOSOffer = {
        price: iOSStoreProduct.price,
        productId: iOSStoreProduct.id,
        type: "",
        periodValue: 1, // Defaulted to 1 (do not try to handle everything)
        periodCount: 1,
        periodUnit: "Mois",
        displayPrice: iOSStoreProduct.baseOfferDisplayPrice,
        paymentMode: "PayUpFront",
        percentageReduction: 0,
        offerId: ""
    }

    // Map offers to displayables
    this._displayables = signal(([baseOffer, ...iOSStoreProduct.offers]).map(offer => {
        const durationText = {
            12: "Annuel", 
            6: "6 mois",
            3: "3 mois",
            1: "Mensuel",
        }[offer.periodValue];
        const displayPrice = offer.displayPrice;
        const isMonthlyPrice = ['Mois', 'Month'].includes(offer.periodUnit) && offer.periodValue === 1;
        const weeklyPrice = this._computeWeeklyPrice(offer);
        const monthlyPrice = this._computeMonthlyPrice(offer);
        const isFree = offer.price === 0;
        const normalPrice = this._computeNormalPrice(offer, baseOffer);
        return { 
          durationText,
          displayPrice,
          isMonthlyPrice,
          weeklyPrice,
          monthlyPrice,
          isFree,
          normalPrice,
          percentageReduction: offer.percentageReduction
        } as DisplayableProduct;
    }).sort((a, b) => a.percentageReduction - b.percentageReduction))
  }


  protected _computeWeeklyPrice(offer: iOSOffer): string {
    const numericPrice = parseFloat(offer.displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.'))

    if (isNaN(numericPrice)) {
      return ''
    }

    let weeklyPrice: number
    switch (offer.periodUnit) {
      case 'Mois':
      case 'Month':
        weeklyPrice = numericPrice / (4.33 * offer.periodValue)
        break
      case 'Semaine':
      case 'Week':
        weeklyPrice = numericPrice / offer.periodValue
        break
      case 'Jour':
      case 'Day':
        weeklyPrice = numericPrice / (7 * offer.periodValue)
        break
      case 'An':
      case 'Year':
        weeklyPrice = numericPrice / (52 * offer.periodValue)
        break
      default:
        weeklyPrice = numericPrice / (4.33 * offer.periodValue)
        break
    }

    const currency = this._extractCurrency(offer.displayPrice.trim())
    return this._applyCurrency(weeklyPrice, currency)
  }

  protected _computeMonthlyPrice(offer: iOSOffer): string | undefined {
    const numericPrice = parseFloat(offer.displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.'))

    if (isNaN(numericPrice)) {
      return undefined
    }

    let monthlyPrice: number
    switch (offer.periodUnit) {
      case 'Mois':
      case 'Month':
        monthlyPrice = numericPrice / offer.periodValue
        break
      case 'Semaine':
      case 'Week':
        monthlyPrice = (numericPrice * 4.33) / offer.periodValue
        break
      case 'Jour':
      case 'Day':
        monthlyPrice = (numericPrice * 30) / offer.periodValue
        break
      case 'An':
      case 'Year':
        monthlyPrice = numericPrice / (12 * offer.periodValue)
        break
      default:
        monthlyPrice = numericPrice / offer.periodValue
        break
    }

    const currency = this._extractCurrency(offer.displayPrice.trim())
    return this._applyCurrency(monthlyPrice, currency)
  }

  protected _computeNormalPrice(offer: iOSOffer, baseOffer: iOSOffer): string {
    if (offer.periodUnit != 'Mois' && baseOffer.periodUnit === 'Mois') {
      return ''
    }
    const nMonth:number = offer.periodValue;
    const normalPrice:number = baseOffer.price * nMonth;
    const currency = this._extractCurrency(offer.displayPrice.trim())
    return this._applyCurrency(normalPrice, currency)
  }
}


