import { AndroidStoreProduct, iOSStoreProduct } from "./abstract-purchase-invoice";
import { signal } from "@angular/core";

export interface DisplayableProduct {
    durationText: string;
    displayPrice: string;
    isMonthlyPrice: boolean;
    weeklyPrice: string;
    monthlyPrice?: string;
    normalPrice: string;
    isFree: boolean;
    percentageReduction?: number;
}

export interface Currency {
    symbol: string;
    position: 'prefix' | 'suffix';
    hasSpace: boolean;
    decimalSeparator: string;
    thousandSeparator: string;
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

    protected _extractCurrency(formattedPrice: string): Currency {
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

    protected _applyCurrency(price: number, currency: Currency): string {
        const [integerPart, decimalPart = '00'] = price.toFixed(2).split('.');

        let formattedInteger = integerPart;
        if (currency.thousandSeparator && integerPart.length > 3) {
            formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
        }

        const formattedPrice = `${formattedInteger}${currency.decimalSeparator}${decimalPart}`;

        if (currency.position === 'prefix') {
            return `${currency.symbol} ${currency.hasSpace ? ' ' : ''}${formattedPrice}`;
        } else {
            return `${formattedPrice} ${currency.hasSpace ? ' ' : ''}${currency.symbol}`;
        }
    }
}