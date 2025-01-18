import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import { Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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

  progress = 0;

  constructor(
    private http: HttpClient,
    private contentService: ContentService,
    private platform: Platform
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
          readData: true
        })
      }catch(e){
        return;
      }
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
    if (!this.autoload){
      this.formControl.setValue(event.target.files[0]);
      return;
    }

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
}
