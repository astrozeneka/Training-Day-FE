import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";

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

  progress = 0;

  constructor(
    private http: HttpClient,
    private contentService: ContentService
  ) { }

  ngOnInit() {}

  clickButton(event: any){
    this.fileInput.nativeElement.click();
  }

  uploadVideo(event: any){
    // Should send a POST request to the server
    const file = event.target.files[0];
    // Should load the video using ReadFile and then send it to the serve
    const reader = new FileReader();
    reader.onload = () => {
      const videoData = reader.result;
      let headers = this.contentService.bearerHeaders()
      headers['Content-Type'] = 'application/json'
      console.log(headers)
      const uploadReq = new HttpRequest(
        'POST',
        `${this.contentService.apiEndpoint}/video`, JSON.stringify({"video": {
          "name": file.name,
          "type": file.type,
          "base64": videoData,
        }}),{
          headers: new HttpHeaders(headers),
          reportProgress: true,
        }
      );
      console.log(uploadReq)

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

  onChange: any = () => {};

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
