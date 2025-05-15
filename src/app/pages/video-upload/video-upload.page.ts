import { Component, OnInit } from '@angular/core';
import { FormComponent } from "../../components/form.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ContentService } from "../../content.service";
import { FeedbackService } from "../../feedback.service";
import { catchError, finalize, throwError } from "rxjs";
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { th } from 'date-fns/locale';

type VideoDestination = 's3' | 'server'
interface File {
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
  template: `<ion-header>
    <ion-toolbar>
        <ion-buttons slot="start">
            <app-back-button></app-back-button>
            <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Uploader une vidéo</ion-title>
    </ion-toolbar>
</ion-header>

<ion-content>
    <h1 class="display-1 ion-padding">Uploader une vidéo</h1>
    <form [formGroup]="form" (submit)="submit()">
        <ion-item>
            <ion-input
                label="Titre"
                label-placement="floating"
                formControlName="title"
                [errorText]="displayedError.title"
            ></ion-input>
        </ion-item>
        <ion-item>
            <ion-input
                label="Titre secondaire (facultatif)"
                label-placement="floating"
                formControlName="sort_field"
                [errorText]="displayedError.sort_field"
            ></ion-input>
        </ion-item>
        <ion-item>
            <ion-textarea
                    label="Description"
                    label-placement="floating"
                    formControlName="description"
                    [rows]="5"
                    [errorText]="displayedError.description"
            ></ion-textarea>
        </ion-item>
        <ion-item>
            <ion-input
                label="Tags"
                label-placement="floating"
                formControlName="tags"
                [errorText]="displayedError.tags"
            ></ion-input>
        </ion-item>
        <ion-item>
            <ion-select
                    formControlName="category"
                    label="Catégorie"
                    label-placement="floating"
            >
                <ion-select-option value="undefined">Non défini</ion-select-option>
                <ion-select-option value="training">Training</ion-select-option>
                <ion-select-option value="training/corps-entier">Training > Corps entier</ion-select-option>
                <ion-select-option value="training/bras">Training > Bras et épaules</ion-select-option>
                <ion-select-option value="training/abdos">Training > Abdos</ion-select-option>
                <ion-select-option value="training/jambes">Training > Jambes</ion-select-option>
                <ion-select-option value="training/fessiers">Training > Fessiers</ion-select-option>
                <ion-select-option value="training/pectoraux">Training > Pectoraux</ion-select-option>
                <ion-select-option value="training/dos">Training > Dos</ion-select-option>

                <ion-select-option value="boxing">Boxing</ion-select-option>
                <ion-select-option value="boxing/base">Boxing > Base</ion-select-option>
                <ion-select-option value="boxing/poings">Boxing > Poings</ion-select-option>
                <ion-select-option value="boxing/pieds-genoux">Boxing > Pieds et genoux</ion-select-option>
                <ion-select-option value="boxing/pieds-poings-genoux">Boxing > Pieds, poings et genoux</ion-select-option>
            </ion-select>
        </ion-item>
        <ion-item>
            <ion-select
                formControlName="privilege"
                label="Privilège requis"
                label-placement="floating"
            >
            <ion-select-option value='public,hoylt,moreno,alonzo'>Tout le monde</ion-select-option>
            <ion-select-option value='hoylt,moreno,alonzo'>Hoylt ou supérieur</ion-select-option>
            <ion-select-option value="moreno,alonzo">Moreno ou supérieur</ion-select-option>
            <ion-select-option value="alonzo">Alonzo</ion-select-option>
            </ion-select>
        </ion-item>
        <ion-item>
            <ion-select
                formControlName="destination"
                label="Destination"
                label-placement="floating"
            >
                <ion-select-option value="s3">Amazon S3</ion-select-option>
                <ion-select-option value="server">Serveur back-end (obsolète)</ion-select-option>
            </ion-select>
        </ion-item>
        <br/>
        <app-upload-video [formControl]="fileControl" [autoload]="false" [progress]="fileProgress"></app-upload-video>
        <br/>
        <app-ux-button 
            expand="block" 
            [disabled]="!valid" 
            shape="round" 
            [loading]="isFormLoading"
            type="submit"
        >Envoyer</app-ux-button>
    </form>
</ion-content>`,
  styles: [``]
})
export class VideoUploadPage extends FormComponent {

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
    private router: Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private cs: ContentService,
    private http: HttpClient
  ) {
    super();
    this.form.valueChanges.subscribe((value) => {
      this.valid = this.form.valid
    })
  }

  ngOnInit() {
  }

  submit() {
    this.isFormLoading = true
    let data: any = this.form.value
    if (data.category) {
      data.tags = data.category + ',' + data.tags
    }
    data.file_id = data.file.id
    data.privilege = data.privilege.split(',')

    if (data.destination == 'server') {
      this.contentService.post('/video', data)
        .pipe(finalize(() => { // WARNING, no validation is present here
          this.isFormLoading = false
          console.log("patch null value to fileControl")
          this.fileControl.patchValue(null) // The fileControl isn't under the form
          this.form.reset()
        }))
        .subscribe((response: any) => {
          // Destroy all properties
          this.form.reset()
          this.fileControl.reset()
          if (response.id) {
            this.feedbackService.register('Votre vidéo a été ajoutée avec succès', 'success')
            this.router.navigate(['/home'])
          } else {
            this.feedbackService.registerNow('Erreur lors de l\'ajout de la vidéo', 'danger')
          }
        })
    } else if (data.destination == 's3') {
      let fileData = (this.fileControl.value as any).blob ? (this.fileControl.value as any).blob : this.fileControl.value
      if (!fileData) {
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
          finalize(() => { }),
          catchError((error) => {
            this.isFormLoading = false
            return throwError(() => error)
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
              return throwError(() => error);
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
                  .pipe(finalize(() => { // WARNING, no validation is present here
                    this.isFormLoading = false
                    this.fileControl.patchValue(null)
                    this.form.reset()
                  }))
                  .subscribe((response: any) => {
                    this.form.reset()
                    this.fileControl.reset()
                    if (response.id) {
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
