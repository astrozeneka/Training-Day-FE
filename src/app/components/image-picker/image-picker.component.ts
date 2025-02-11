import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { ContentService } from 'src/app/content.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';

/**
 * TODO: IMPORTANT!!!! Handle feedback (both fe and be side)
 */
@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImagePickerComponent),
      multi: true
    }
  ],
})
export class ImagePickerComponent  implements OnInit, ControlValueAccessor {
  // The form control
  @Input() formControl: FormControl<any|string> | undefined;
  @Input() formControlName: string|undefined;

  // Input native element (for web only)
  @ViewChild('fileInput') fileInput: any = undefined;
  
  // Custom parent to child property
  @Input() label: string = "Ajouter"
  @Input() accept: string = "image/*"

  // Feedback error
  @Input() errorText: string = undefined

  // The color
  @Input() color: string = "medium"

  // Choose to select image or file
  @Input() mode: string = "image"

  constructor(
      private http: HttpClient,
      private contentService: ContentService,
      private platform: Platform,
      private cdr: ChangeDetectorRef,
      private controlContainer: ControlContainer,
  ){ }


  ngOnInit() {
    this.formControl = this.formControl || this.controlContainer.control?.get(this.formControlName!) as FormControl<any[]|string>;
  }

  /**
   * Handles button click and file upload (using capacitor library)
   */
  async clickButton(event: any){
    if (this.platform.is('capacitor')){
      let result
      try{
        if (this.mode === 'image'){
          result = await FilePicker.pickImages({
            limit: 1,
            readData: true,
            skipTranscoding: false
          })
        } else if (this.mode === 'file'){
          result = await FilePicker.pickFiles({
            limit: 1,
            readData: true
          })
        } else {
          console.error("Mode not supported")
          return
        }
      } catch (e){
        console.error(e)
      }
      if (result['files'].length > 0) {
        let fileData = result['files'][0]
        let previewUrl = `data:${fileData.mimeType};base64,${fileData.data}`;
        let fileBlob = this.dataUriToBlob(previewUrl);
        this.formControl?.setValue({
          name: result['files'][0].name,
          blob: fileBlob,
          type: result['files'][0].mimeType
        });
        this.cdr.detectChanges()
      }
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle web file input change (for web only)
   */
  fileInputChanged(event: any){
    this.formControl.setValue(event.target.files[0]);
  }

  private dataUriToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  /**
   * Related to ControlValueAccessor class
   */
  writeValue(obj: any): void {
    // Generally empty
  }

  onChange: any = () => {};
  /**
   * Related to ControlValueAccessor class
   */
  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  onTouch: any = () => {};
  /**
   * Related to ControlValueAccessor class
   */
  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }

  /**
   * Related to ControlValueAccessor class
   */
  setDisabledState?(isDisabled: boolean): void {
    // Generally empty
  }
}
