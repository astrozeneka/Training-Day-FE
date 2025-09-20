import { ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnInit } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Product, PromoOfferIOS } from 'src/app/custom-plugins/store.plugin';

@Component({
  selector: 'app-promotional-bubble-selector-ios',
  templateUrl: './promotional-bubble-selector-ios.component.html',
  styleUrls: ['../promotional-bubble-selector/promotional-bubble-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PromotionalBubbleSelectorIosComponent),
      multi: true
    }
  ]
})
export class PromotionalBubbleSelectorIosComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() formControl: FormControl<any> | undefined;
  @Input() formControlName: string | undefined;
  @Input() label: string = ""
  @Input() errorText: string | undefined = undefined

  @Input() product: Product // IMMPORTANT: iOS product is totally different from Android product
  offers: PromoOfferIOS[] = []
  
  // Weekly price calculations
  baseWeeklyPrice: string = ''
  offerWeeklyPrices: {[key: string]: string} = {}

  constructor(
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[] | string>;
    this.offers = this.product?.offers as PromoOfferIOS[]
    this.calculateWeeklyPrices()
  }

  ngOnChanges() {
    if (this.product) {
      this.offers = this.product?.offers as PromoOfferIOS[]
      this.calculateWeeklyPrices()
    }
  }

  writeValue(obj: any): void {
    //throw new Error('Method not implemented.');
  }

  onChange: any = () => { };
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouch: any = () => { }; /// onTouched
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // To do for future implementation
  }

  chooseOption(choice: Product|PromoOfferIOS) {
    this.formControl.setValue(choice)
    this.cdr.detectChanges()
  }

  private calculateWeeklyPrices() {
    if (this.product) {
      // Calculate base price weekly
      const basePrice = this.product.baseOfferDisplayPrice || this.product.displayPrice
      this.baseWeeklyPrice = this.getWeeklyPrice(basePrice)
      
      // Calculate offer weekly prices
      if (this.offers) {
        this.offers.forEach(offer => {
          console.log("===> Offer", JSON.stringify(offer))
          this.offerWeeklyPrices[offer.offerId] = this.getWeeklyPrice(offer.displayPrice, offer.periodUnit, offer.periodValue)
        })
      }
    }
  }

  private getWeeklyPrice(displayPrice: string, periodUnit = 'Mois', periodValue = 1): string {
    console.log("Calculating weekly price for display price (ios): " + displayPrice)
    const numericPrice = parseFloat(displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.'))

    if (isNaN(numericPrice)) {
      return ''
    }

    let weeklyPrice: number
    switch (periodUnit) {
      case 'Mois':
      case 'Month':
        weeklyPrice = numericPrice / (4.33 * periodValue)
        break
      case 'Semaine':
      case 'Week':
        weeklyPrice = numericPrice / periodValue
        break
      case 'Jour':
      case 'Day':
        weeklyPrice = numericPrice / (7 * periodValue)
        break
      case 'An':
      case 'Year':
        weeklyPrice = numericPrice / (52 * periodValue)
        break
      default:
        weeklyPrice = numericPrice / (4.33 * periodValue)
        break
    }

    return weeklyPrice.toFixed(2).replace('.', ',')
  }

}
