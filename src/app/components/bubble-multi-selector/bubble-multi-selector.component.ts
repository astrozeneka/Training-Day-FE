import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlContainer, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-bubble-multi-selector',
  templateUrl: './bubble-multi-selector.component.html',
  styleUrls: ['./bubble-multi-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BubbleMultiSelectorComponent),
      multi: true
    }
  ]
})
export class BubbleMultiSelectorComponent<T> implements OnInit {
  @Input() formControl: FormControl<any> | undefined;
  @Input() formControlName: string|undefined;
  @Input() label: string = ""
  @Input() errorText: string | undefined = undefined

  // The key accessor for custom display
  @Input() keyAccessor: (option: any) => string = (option: any) => option.toString();

  // The options
  @Input() options: T[] = [];

  // Mode (single or multiple)
  @Input() mode: 'single'|'multiple' = 'multiple';

  constructor(
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[]|string>;
  }

  chooseOption(option:T){
    this.formControl.markAsTouched()
    
    if(this.mode === 'single'){
      this.formControl?.setValue(option)
    }else{ // this.mode == 'multiple'
      let alreadySelected = this.formControl?.value || [];
      if (alreadySelected.includes(option)){
        this.formControl.setValue(alreadySelected.filter(o => o !== option))
      } else { // Add
        this.formControl?.setValue([...alreadySelected, option])
      }
    }
    this.cdr.detectChanges()
  }

  writeValue(obj: any): void {
    //throw new Error('Method not implemented.');
    // Generally not used
  }

  setDisabledState?(isDisabled: boolean): void {
    // To do for future implementation
    // Generally not used
  }

  onChange: any = () => {};
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouch: any = () => {}; /// onTouched
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  

}
