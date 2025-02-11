import { Component, OnInit } from '@angular/core';
import {FormComponent} from "../../components/form.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {catchError, finalize, throwError} from "rxjs";
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
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
  file: File,
  awsUrl?: string
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

  // The file upload (from aws s3)
  fileProgress: number = 0;

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
      let fileData = (this.fileControl.value as any).blob ? (this.fileControl.value as any).blob : this.fileControl.value
      if (!fileData){
        this.feedbackService.registerNow('Veuillez sélectionner un fichier', 'danger')
        this.isFormLoading = false
        return
      }
      // console.log(fileData)
      // console.log('/video-upload/get-presigned-url?file_name=' + fileData.name + '&file_type=' + fileData.type)
      // Step 1. request for presigned-url from back-end server
      
      this.isFormLoading = true
      this.cs.get('/video-upload/get-presigned-url?file_name=' + this.fileControl.value.name + '&file_type=' + this.fileControl.value.type)
        .pipe(
          finalize(()=>{}),
          catchError((error)=>{
            this.isFormLoading = false
            return throwError(()=>error)
          })
        )
        .subscribe((response: { url: string }[]) => {
          console.log('Response: ', response);
          // Step 2. Upload the file to the S3 server as binary
          const formData = new FormData();
          formData.append('file', fileData as any, this.fileControl.value.name);
          console.log(fileData.type)

          const req = new HttpRequest('PUT', response[0].url, fileData, {
            headers: new HttpHeaders({
              'Content-Type': fileData.type // A bug might arise here (see add-recipe.page.ts)
            }),
            reportProgress: true,
          });
          this.http.request(req)
            .pipe(catchError((error) => {
              console.error('Error uploading file:', error);
              this.isFormLoading = false
              return throwError(()=>error);
            }))
            .subscribe((event: any) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.fileProgress = event.loaded / event.total;
                console.log(this.fileProgress);
              } else if (event.type === HttpEventType.Response) {
                console.log(event);
                this.isFormLoading = false

                //Step 4, send data to server
                // event.url = "https://trainingday-videos.s3.ap-southeast-1.amazonaws.com/file-5.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQFCM7XNFTJ5DTAHY%2F20250118%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20250118T143942Z&X-Amz-SignedHeaders=host&X-Amz-Expires=900&X-Amz-Signature=00819f7ce173e9ad299eaebf0b1303ce44621a631efefb09dfe9ba6f892d00bd"
                let awsUrl = event.url.split('?')[0]
                let videoData = {
                  ...this.form.value,
                  awsUrl
                }
                this.cs.post('/video', videoData)
                  .pipe(finalize(()=>{ // WARNING, no validation is present here
                    this.isFormLoading = false
                    this.fileControl.patchValue(null)
                    this.form.reset()
                  }))
                  .subscribe((response:any)=>{
                    this.form.reset()
                    this.fileControl.reset()
                    if(response.id){
                      this.feedbackService.register('Votre vidéo a été ajoutée avec succès', 'success')
                      this.router.navigate(['/home'])
                    } else {
                      this.feedbackService.registerNow('Erreur lors de l\'ajout de la vidéo', 'danger')
                    }
                  })

              }
            });
        });
    }
  }

}
