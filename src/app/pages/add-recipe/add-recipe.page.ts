import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, filter, finalize, map, merge, switchMap, tap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})
export class AddRecipePage implements OnInit {

  form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]), // In the BE, it is not required
    'category': new FormControl('', [Validators.required]),
    'image': new FormControl(null, [Validators.required]),
    'pdfSmallPhone': new FormControl(null, []),
    'pdfLargePhone': new FormControl(null, [Validators.required]),
    'pdfTablet': new FormControl(null, []),
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'category': undefined,
    'image': undefined,
    'pdfSmallPhone': undefined,
    'pdfLargePhone': undefined,
    'pdfTablet': undefined,
  }
  valid:boolean = false;
  isFormLoading: boolean = false

  constructor(
      private router:Router,
      private contentService: ContentService,
      private feedbackService: FeedbackService,
      private cs: ContentService,
      private http: HttpClient) { }

  ngOnInit() {
    // When the status of the form chane-ged
    this.form.statusChanges.subscribe((status)=>{
      this.valid = status === 'VALID'
    })
  }

  updateFileUploadProgress(loaded:number, total:number){
    console.log(loaded, total)
  }

  submitFile(url, file:{name:string, type:string, blob:any}, slug:string){
    return this.cs.getOne(url, {filename:file.name, filetype:file.type})
      .pipe(
        catchError((err)=>{
          console.error(err)
          return throwError(()=>err)
        }),
        switchMap((res:{url:string})=>{
          const formData = new FormData();
          let fileData = file.blob ? file.blob: file
          formData.append('file', fileData as any, file.name)
          const req = new HttpRequest('PUT', res.url, formData, {
            headers: new HttpHeaders({
              'Content-Type': file.type
            }),
            reportProgress: true,
          });
          return this.http.request(req)
            .pipe(
              catchError((err)=>{
                console.error(err)
                return throwError(()=>err)
              }),
              map((event)=>{
                if(event.type === HttpEventType.UploadProgress){
                  this.updateFileUploadProgress(event.loaded, event.total)
                }
                return {...event, slug}
              })
            )
        })
      )
  }

  submit(){
    this.isFormLoading = true

    let fileUploaders = []
    if (this.form.value.image)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.image, 'image'))
    if (this.form.value.pdfSmallPhone)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.pdfSmallPhone, 'pdfSmallPhone'))
    if (this.form.value.pdfLargePhone)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.pdfLargePhone, 'pdfLargePhone'))
    if (this.form.value.pdfTablet)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.pdfTablet, 'pdfTablet'))
    
    // Merge all the requests
    let files = []
    let urls = {}
    let errors = []
    merge(...fileUploaders)
      .pipe(
        catchError((err)=>{
          // Error can be simulated later
          console.error(err)
          return throwError(()=>err)
        }),
        tap((res:{type,slug,url})=>{ // URL is only available if res.type == Response
          if (res.type === HttpEventType.UploadProgress && !files.includes(res.slug)){
            files.push(res.slug)
          }
          if (res.type === HttpEventType.Response && files.includes(res.slug)){
            files = files.filter((slug)=>slug !== res.slug)
            urls[res.slug] = res.url.split('?')[0]
          }
        }),
        filter((res: { type: HttpEventType, slug: string }) => {
          return res.type === HttpEventType.Response && files.length === 0
        }),
        /*,*/
        // Upload to the server using the traditionnal POST endpoint for uploading video
        switchMap((res:any)=>{
          let data = {
            title: this.form.value.title,
            description: this.form.value.description,
            category: this.form.value.category,
            imageUrl: urls['image'] ?? '',
            pdfSmallPhoneUrl: urls['pdfSmallPhone'] ?? '',
            pdfLargePhoneUrl: urls['pdfLargePhone'] ?? '',
            pdfTabletUrl: urls['pdfTablet'] ?? '',
          }
          return this.cs.post('/recipes/', data)
            .pipe(catchError((err)=>{
              console.error(err)
              return throwError(()=>err)
            }))
        }),
        finalize(()=>{
          this.isFormLoading = false
        })
      )
      .subscribe((res:any)=>{
        this.form.reset()
        if (res.id) {
          this.feedbackService.register('Votre recette a été ajoutée avec succès', 'success')
          this.router.navigate(['/home'])
        } else {
          this.feedbackService.registerNow('Erreur lors de l\'ajout de la recette', 'danger')
        }
      })
      

    /*

    this.cs.getOne(`/recipe-upload/get-presigned-url`, {
      filename: this.form.value.image.name,
      filetype: this.form.value.image.type
    })
    .pipe(
      catchError((err)=>{
        console.error(err)
        return throwError(()=>err)
      }),
      switchMap((res:{url:string})=>{
        const formData = new FormData();
        let fileData = (this.form.value.image as any).blob ? (this.form.value.image as any).blob : this.form.value.image
        console.log(fileData)
        formData.append('file', fileData as any, this.form.value.image.name)
        const req = new HttpRequest('PUT', res.url, formData, {
          headers: new HttpHeaders({
            'Content-Type': fileData.type
          }),
          reportProgress: true,
        });
        return this.http.request(req)
          .pipe(catchError((err)=>{
            console.error(err)
            return throwError(()=>err)
          }))
      })
    )
    .subscribe((res)=>{
      console.log(res)
    })
    */
  }
}
