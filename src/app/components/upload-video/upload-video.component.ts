import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
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
export class UploadVideoComponent  implements OnInit {

  @ViewChild('fileInput') fileInput: any = undefined;

  @Input() label: string = "Ajouter une vidéo";

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
      this.contentService.post('/video', {'video':{
        "name": file.name,
        "type": file.type,
        "base64": videoData,
      }}).subscribe((data)=>{
        console.log(data);
      });
    }
    reader.readAsDataURL(file);
  }

}
