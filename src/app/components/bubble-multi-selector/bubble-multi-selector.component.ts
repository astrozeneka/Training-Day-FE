import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlContainer, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-bubble-multi-selector',
  template: `
  <div [class]="'multi-selector-component ' + variant">
  <div [class]="'label' + (disabled || isDisabled ? ' disabled' : '')">{{ label }}</div>
  <div class="wrapper">
    <ion-button
      *ngFor="let option of options"
      fill="clear"
      expand="block"
      color="dark"
      [disabled]="disabled || isDisabled"
      [class]="'clickable-option ' + ((
        (mode == 'single' && keyAccessor(this.formControl.value) == keyAccessor(option)) ||
        (mode == 'multiple' && formControl.value.includes(option))?'active':''))"
      (click)="chooseOption(option)"
    >
      <div class="inner">
        <div class="content">
          <div>
            {{ keyAccessor(option) ? keyAccessor(option) : option }}
          </div>
        </div>
        <div class="right">
          <div class="rounded-rectangle"><div class="active-indicator">
            <ion-icon name="checkmark"></ion-icon>
          </div></div>
        </div>
      </div>
    </ion-button>
  </div>
  <div class="input-error" *ngIf="formControl?.invalid && formControl?.touched">
    {{ formControl.errors | errorMessage: errorText }}
  </div>
</div>
  `,
  styles: [`
@mixin input-error-1{
    font-size: 14px;
    line-height: 21px;
    margin-top: 6px;
    color: var(--ion-color-danger);
}

.input-error{ // Reused by the chip-input, should consider to put it in a higher level stylesheet
    @include input-error-1;
    margin-top: -6px!important;
}

.multi-selector-component{
    display: flex;
    flex-direction: column;
    gap: 10px;

    & .label{
        font-size: 14px;
        padding-left: 5px;
        padding-top: 20px;
    }

    & .clickable-option{
        --padding-start: 18px;
        --padding-end: 18px;
        --padding-top: 18px;
        --padding-bottom: 18px;
        --border-color: var(--ion-color-lightgrey);
        --border-width: 1px;
        --border-style: solid;

        & .inner{
            text-align: left;
            text-transform: none;
            width: 100%;
            font-weight: normal;
            display: flex;
            gap: 5px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            & .content{
                // Wrap content
                flex-grow: 1;
                overflow: hidden;
                & > *{
                    // Let the content go to enw line
                    white-space: normal;

                }
            }

            & .right{
                & .rounded-rectangle{
                    background: rgba(var(--ion-color-lightgrey-rgb), 0.4);
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    border-radius: 15%;
                    overflow: hidden;
                    & .active-indicator{
                        background: var(--ion-color-primary);
                        opacity: 0;
                        transition: opacity 0.4s;
                        width: 100%;
                        height: 100%;
                        display: inline-block;
                        position: relative;
                        & ion-icon{
                            color: white;
                            // Center it
                            position:absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        }
                    }
                }
            }
        }

        &.active{
            --border-color: var(--ion-color-primary);

            & .inner .right .rounded-rectangle .active-indicator{
                opacity: 1;
            }
        }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        
        & .inner {
          pointer-events: none;
          
          & .content {
            color: var(--ion-color-medium);
          }
          
          & .right .rounded-rectangle {
            background: rgba(var(--ion-color-medium-rgb), 0.3);
          }
        }
        
        &:hover {
          background: transparent;
        }
      }
    }

    // The horizontal version
    &.horizontal{
        & .wrapper{
            display: flex;
            flex-direction: row!important;
            flex-wrap: wrap;
            & > *{
                flex-grow: 1;
            }
        }
    }


}
  `],
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
  @Input() formControlName: string | undefined;
  @Input() label: string = ""
  @Input() errorText: string | undefined = undefined

  // Variant
  @Input() variant: string = 'default';

  // The key accessor for custom display
  @Input() keyAccessor: (option: any) => string = (option: any) => option.toString();

  // The options
  @Input() options: T[] = [];

  // Mode (single or multiple)
  @Input() mode: 'single' | 'multiple' = 'multiple';

  // The disable state (https://claude.ai/chat/17181060-6987-415b-b4bc-8a712c181132)
  @Input() disabled: boolean = false;
  public isDisabled: boolean = false;

  constructor(
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[] | string>;
  }

  chooseOption(option: T) {
    if (this.disabled || this.isDisabled) {
      return;
    }
    this.formControl.markAsTouched()

    if (this.mode === 'single') {
      if (this.formControl.value === option) {
        this.formControl.setValue(null)
        this.onTouch()
        return
      } else {
        this.formControl?.setValue(option)
      }
    } else { // this.mode == 'multiple'
      let alreadySelected = this.formControl?.value || [];
      if (alreadySelected.includes(option)) {
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
    this.isDisabled = isDisabled;
    this.cdr.detectChanges();
  }

  onChange: any = () => { };
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouch: any = () => { }; /// onTouched
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
