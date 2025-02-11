import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import { Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ChangeDetectorRef } from '@angular/core';

function base64ToBlob(base64String, contentType = '') {
  const byteCharacters = atob(base64String);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
  }
  const byteArray = new Uint8Array(byteArrays);
  return new File([byteArray], "video.mp4", { type: contentType });
  // return new Blob([byteArray], { type: contentType });
}

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadVideoComponent),
      multi: true,
    },
  ],
})
export class UploadVideoComponent  implements ControlValueAccessor, OnInit {

  @ViewChild('fileInput') fileInput: any = undefined;
  @Input() label: string = "Ajouter une vidéo";
  @Input() formControl: any = undefined;
  file: any = undefined;
  // This will automatically send the video to the server after the user select the file
  @Input() autoload: boolean = true;

  @Input() progress = 0;

  constructor(
    private http: HttpClient,
    private contentService: ContentService,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formControl.valueChanges.subscribe((value: any) => {
      if (!value){
        this.progress = 0
      }
    })
  }

  async clickButton(event: any){
    if (this.platform.is('capacitor')) {
      let result;
      try{
        result = await FilePicker.pickVideos({
          limit: 1,
          readData: true // Experimental, change true for the old way
        })
      }catch(e){
        return;
      }
      if (!this.autoload){ // Autoload is deactivated (the new way)
        if (result['files'].length > 0) { // == 1
          let fileData = result['files'][0]
          let previewUrl = `data:${fileData.mimeType};base64,${fileData.data}`;
          let fileBlob = this.dataUriToBlob(previewUrl);
          this.formControl.setValue({
            name: result['files'][0].name,
            blob: fileBlob, // Specific to mobile
            type: result['files'][0].mimeType
          });
          console.log("=>" + this.formControl.value.name)
          this.cdr.detectChanges();
          return;
          
        } else {
          console.log("No file selected");
        }
      } else { // THe old way: load the file first, and send data later
        if (result['files'].length > 0) { // == 1
          let file = result["files"][0]
          let data = result.files[0].data
          data = "data:" + file.mimeType + ";base64," + data
          this.file = {
            name: file.name,
            type: file.mimeType,
            base64: data 
          }
        }
        console.log("File picked, processing to upload");
        this.processVideoUpload();
      }
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processVideoUpload(){
    let headers = this.contentService.bearerHeaders()
    headers['Content-Type'] = 'application/json'
    const uploadReq = new HttpRequest(
      'POST',
      `${this.contentService.apiEndpoint}/video`, JSON.stringify({"video": {
        "name": this.file.name,
        "type": this.file.type,
        "base64": this.file.base64,
      }}),{
        headers: new HttpHeaders(headers),
        reportProgress: true,
      }
    );
    this.http.request(uploadReq).subscribe((event:any) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = event.loaded / event.total;
        console.log('Upload Progress: ' + Math.round(event.loaded / event.total * 100) + '%');
      }else if (event.type === HttpEventType.Response) {
        // Update the component value
        this.formControl.setValue(event.body);
        this.onChange(event.body);
      }
    })
  }

  uploadVideo(event: any){
    if (!this.autoload){ // Autoload is deactivated (the new way)
      this.formControl.setValue(event.target.files[0]);
      console.log(event.target.files[0]);
      return;
    }
    // THe old way: load the file first, and send data later


    // Should send a POST request to the s
    const file = event.target.files[0];
    // Should load the video using ReadFile and then send it to the serve
    const reader = new FileReader();
    reader.onload = () => {
      const videoData = reader.result;
      this.file = {
        name: file.name,
        type: file.type,
        base64: videoData
      }
      this.processVideoUpload();
      
      
      

      /*this.http.post(`${environment.apiEndpoint}/video`, {'video':{
          "name": file.name,
          "type": file.type,
          "base64": videoData,
        }}, {headers})*/

      /*this.contentService.post('/video', {'video':{
        "name": file.name,
        "type": file.type,
        "base64": videoData,
      }}).subscribe((data)=>{
        console.log(data);
      });*/
    }
    reader.readAsDataURL(file);
  }

  clear(){
    this.fileInput.nativeElement.value = null;
  }

  onChange: any = (val) => {
  };

  onTouch: any = () => {};

  writeValue(value: any) {
    // No need to store as it is already stored as a property of the formControl
  }

  registerOnChange(fn:any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn
  }

  /**
   * https://github.com/the-vv/college-notifier-app/blob/36a17186a0865fba01669fea2da70ac44e86a5d4/src/app/shared/file-upload/file-upload.component.ts#L122
   * @param dataURI 
   * @returns 
   */
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
}
