import { ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnInit } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AndroidSubscriptionOffer, Product, PromoOfferIOS } from 'src/app/custom-plugins/store.plugin';

@Component({
  selector: 'app-promotional-bubble-selector',
  templateUrl: './promotional-bubble-selector.component.html',
  styleUrls: ['./promotional-bubble-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PromotionalBubbleSelectorComponent),
      multi: true
    }
  ]
})
export class PromotionalBubbleSelectorComponent  implements ControlValueAccessor, OnInit {
  @Input() formControl: FormControl<any> | undefined;
  @Input() formControlName: string|undefined;
  @Input() label: string = ""
  @Input() errorText: string | undefined = undefined
  // @Input() variant: string = "default" // Might be used later

  @Input() product:Product

  // Experimental mode: for android, the base offers are included inside the offer property (no need since this component is fully reserved for the android version)
  @Input() os:'ios'|'android' = 'ios'

  constructor(
      private controlContainer: ControlContainer,
      private cdr: ChangeDetectorRef
   ) { }

  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[]|string>;
    // FOR android
    // recurringMode: 1 (INFINITE_RECURRING), 2 (FINITE_RECURRING), 3 (NON_RECURRING)
    // Listen for event 
    // TODO ...
    console.log("passed product is " + JSON.stringify(this.product))
  }

  writeValue(obj: any): void {
    //throw new Error('Method not implemented.');
  }

  onChange: any = () => {};
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouch: any = () => {}; /// onTouched
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // To do for future implementation
  }

  chooseOption(choice:Product|PromoOfferIOS|any){
    this.formControl.setValue(choice)
    this.cdr.detectChanges()
  }
}
