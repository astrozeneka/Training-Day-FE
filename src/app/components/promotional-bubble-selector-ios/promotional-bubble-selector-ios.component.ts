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

  constructor(
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[] | string>;
    this.offers = this.product?.offers as PromoOfferIOS[]
  }

  ngOnChanges() {
    if (this.product) {
      this.offers = this.product?.offers as PromoOfferIOS[]
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

}
