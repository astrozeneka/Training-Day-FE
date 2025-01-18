import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {finalize} from "rxjs";
import { HttpClient } from '@angular/common/http';
import { th } from 'date-fns/locale';

type VideoDestination = 's3' | 'server'
interface File{
  name: string
  size: number
  type: string
  base64: string
}
interface VideoFormData {
  title: string
  description: string
  tags: string
  category: string
  privilege: string[]
  sort_field: string
  destination: string
  file: File
}

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.page.html',
  styleUrls: ['./video-upload.page.scss'],
})
export class VideoUploadPage extends FormComponent{

  fileControl = new FormControl<File>(null, [Validators.required]);
  override form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'tags': new FormControl('', []),
    'category': new FormControl('', []),
    'privilege': new FormControl('public,hoylt,moreno,alonzo', []),
    'sort_field': new FormControl('', []),
    'destination': new FormControl<VideoDestination>('s3', [Validators.required]),
    'file': this.fileControl
  });
  isFormLoading = false;
  valid = false;

  override displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
    'category': undefined,
    'privilege': undefined,
    'sort_field': undefined,
    'destination': undefined
  }

  constructor(
    private router:Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private cs: ContentService,
    private http: HttpClient
  ) {
    super();
    this.form.valueChanges.subscribe((value)=>{
      this.valid = this.form.valid
    })
  }

  ngOnInit() {
  }

  submit(){
    this.isFormLoading = true
    let data:any = this.form.value
    if (data.category){
      data.tags = data.category + ',' + data.tags
    }
    data.file_id = data.file.id
    data.privilege = data.privilege.split(',')
    
    if (data.destination == 'server'){
      this.contentService.post('/video', data)
        .pipe(finalize(()=>{ // WARNING, no validation is present here
          this.isFormLoading = false
          console.log("patch null value to fileControl")
          this.fileControl.patchValue(null) // The fileControl isn't under the form
          this.form.reset()
        }))
        .subscribe((response:any)=>{
          // Destroy all properties
          this.form.reset()
          this.fileControl.reset()
          if(response.id){
            this.feedbackService.register('Votre vidéo a été ajoutée avec succès', 'success')
            this.router.navigate(['/home'])
          }else{
            this.feedbackService.registerNow('Erreur lors de l\'ajout de la vidéo', 'danger')
          }
        })
    } else if (data.destination == 's3'){
      let fileData = this.fileControl.value
      console.log(fileData)
      console.log('/video-upload/get-presigned-url?file_name=' + fileData.name + '&file_type=' + fileData.type)
      // Step 1. request for presigned-url from back-end server
      this.cs.get('/video-upload/get-presigned-url?file_name=' + fileData.name + '&file_type=' + fileData.type)
        .pipe(finalize(()=>{
          this.isFormLoading = false
          // ...
        }))
        .subscribe((response: { url: string }[]) => {
          console.log('Response: ', response);
          // Step 2. Upload the file to the S3 server as binary
          const formData = new FormData();
          formData.append('file', fileData as any);
          console.log(fileData.type)
          this.http.put(response[1].url, fileData, {
            headers: {
              'Content-Type': fileData.type
            }
          }).subscribe((response: any) => {
            console.log(response);
          }, (error) => {
            console.error('Error uploading file:', error);
          });
        });
    }
  }

}
