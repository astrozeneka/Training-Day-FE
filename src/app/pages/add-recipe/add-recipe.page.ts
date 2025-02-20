import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { catchError, distinctUntilChanged, filter, finalize, map, merge, of, switchMap, tap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { FeedbackService } from 'src/app/feedback.service';
import { Recipe, RecipesService } from 'src/app/recipes.service';

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
    'docSmallPhone': new FormControl(null, []),
    'docLargePhone': new FormControl(null, [Validators.required]),
    'docTablet': new FormControl(null, []),
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'category': undefined,
    'image': undefined,
    'docSmallPhone': undefined,
    'docLargePhone': undefined,
    'docTablet': undefined,
  }
  valid:boolean = false;
  isFormLoading: boolean = false

  // Progress value
  progress:number = 0

  // Form mode
  formMode: 'add'|'edit' = 'add';
  recipeId: number = undefined; // In case of formMode == 'edit' only

  // Delete button loading
  deleteIsLoading: boolean = false

  // Category list to improve User experience
  categories:string[] = []


  constructor(
      private router:Router,
      private contentService: ContentService,
      private feedbackService: FeedbackService,
      private cs: ContentService,
      private http: HttpClient,
      private cdr: ChangeDetectorRef,
      private rs: RecipesService,
      private asc: ActionSheetController
    ) { }

  ngOnInit() {

    // When the status of the form chane-ged
    this.form.statusChanges.subscribe((status)=>{
      this.valid = status === 'VALID'
    })

    // Handle the form mode
    this.router.events
      .pipe(
        filter((event)=>event instanceof NavigationEnd  && (event.url.includes('add-recipe') || event.url.includes('edit-recipe'))),
        tap((event:NavigationEnd)=>{
          if (this.router.url.includes('add-recipe')){
            this.formMode = 'add'
          } else if (this.router.url.includes('edit-recipe')){
            this.formMode = 'edit'
            this.recipeId = parseInt(this.router.url.split('/').pop())
          }
        }),
        filter((event:NavigationEnd)=>event.url.includes('edit-recipe')),
        switchMap(()=>{
          // IF the mode is edit, load recipe data (using recipe-service)
          return this.rs.onRecipeDetail(this.recipeId, true, true)
        })
      )
      .subscribe((res:Recipe)=>{
        // Image filling
        let imagePlaceholder = {
          image: res.imageUrl ? {name: res.imageUrl.split('/').pop(), isPlaceholder: true} : undefined,
          docSmallPhone: res.docSmallPhoneUrl ? {name: res.docSmallPhoneUrl.split('/').pop(), isPlaceholder: true} : undefined,
          docLargePhone: res.docLargePhoneUrl ? {name: res.docLargePhoneUrl.split('/').pop(), isPlaceholder: true} : undefined,
          docTablet: res.docTabletUrl ? {name: res.docTabletUrl.split('/').pop(), isPlaceholder: true} : undefined
        }
        this.form.patchValue({...res, ...imagePlaceholder})
      })

    // Load the category information
    this.rs.onCategoryData(true, true).subscribe((data:string[])=>{
      this.categories = data
    })
  }

  _loadedFiles = {}
  updateFileUploadProgress(loaded:number, total:number, slug:string, fileNumber:number){
    console.log(loaded, total, slug)
    this._loadedFiles[slug] = [loaded, total, fileNumber]
    // If the total number of key == fileNumber
    if (Object.keys(this._loadedFiles).length === fileNumber){
      let loaded = 0
      let total = 0
      for (let key in this._loadedFiles){
        loaded += this._loadedFiles[key][0]
        total += this._loadedFiles[key][1]
      }
      this.progress = loaded / total
      console.log(`Progress: ${this.progress}`)
      this.cdr.detectChanges()
    }
  }

  submitFile(url, file:{name:string, type:string, blob:any}, slug:string){
    return this.cs.getOne(url, {filename:file.name, filetype:file.type})
      .pipe(
        catchError((err)=>{
          console.error(err)
          return throwError(()=>err)
        }),
        switchMap((res:{url:string})=>{
          const fileData = file.blob ? file.blob: file
          const req = new HttpRequest('PUT', res.url, fileData, {
            headers: new HttpHeaders({
              'Content-Type': file.type
            }),
            reportProgress: true,
          });
          console.log(JSON.stringify(req))
          return this.http.request(req)
            .pipe(
              catchError((err)=>{
                console.error(JSON.stringify(err))
                return throwError(()=>err)
              }),
              map((event)=>{
                console.log("Here", JSON.stringify(res))
                return {...event, slug}
              })
            )
        })
      )
  }

  reset(){
    this.form.reset()
    this.form.get('image')?.setValue(null)
    this.form.get('docSmallPhone')?.setValue(null)
    this.form.get('docLargePhone')?.setValue(null)
    this.form.get('docTablet')?.setValue(null)
    this.progress = 0;
  }

  submit(){
    this.isFormLoading = true

    let fileUploaders = []
    if (this.form.value.image && !this.form.value.image.isPlaceholder)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.image, 'image'))
    if (this.form.value.docSmallPhone && !this.form.value.docSmallPhone.isPlaceholder)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.docSmallPhone, 'docSmallPhone'))
    if (this.form.value.docLargePhone && !this.form.value.docLargePhone.isPlaceholder)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.docLargePhone, 'docLargePhone'))
    if (this.form.value.docTablet && !this.form.value.docTablet.isPlaceholder)
      fileUploaders.push(this.submitFile(`/recipe-upload/get-presigned-url`, this.form.value.docTablet, 'docTablet'))
    console.log(fileUploaders)
    // Merge all the requests
    let files = []
    let urls = {}
    let errors = []
    console.log("Formmode", this.formMode)
    console.log(this.form.value.image)
    console.log(this.form.value.docLargePhone)
    // Handle empty file
    if (fileUploaders.length === 0){
      if (this.formMode == 'add'){
        this.feedbackService.registerNow('Veuillez sélectionner au moins une image', 'danger')
        this.isFormLoading = false
        return
      } else { // This.formMode == 'edit'
        fileUploaders = [
          of({
            type: HttpEventType.Response,
            slug: 'no-file', // a dummy slug to identify this event
            url: this.form.value.image?.url || '' // optionally pass the current image URL if available
          })
        ]
      }
    }
    merge(...fileUploaders)
      .pipe(
        catchError((err)=>{
          // Error can be simulated later
          console.error(`Error while uploading file : ${JSON.stringify(err)}`)
          return throwError(()=>err)
        }),
        tap((res:{type,slug,url})=>{ // URL is only available if res.type == Response
          if (res.type === HttpEventType.UploadProgress){
            if (!files.includes(res.slug)){
              files.push(res.slug)
            }
            this.updateFileUploadProgress((res as any).loaded, (res as any).total, res.slug, fileUploaders.length)
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
                //imageUrl: urls['image'] ?? '',
                //docLargePhoneUrl: urls['docLargePhone'] ?? null,
            // Optional fields
            ...(urls['image'] ? {imageUrl: urls['image']} : {}),
            ...(urls['docLargePhone'] ? {docLargePhoneUrl: urls['docLargePhone']} : {}),
            
            ...(urls['docSmallPhone'] ? {docSmallPhoneUrl: urls['docSmallPhone']} : {}),
            ...(urls['docTablet'] ? {docTabletUrl: urls['docTablet']} : {})
          }
          console.log(data)
          if (this.formMode === 'add'){
            return this.cs.post('/recipes', data)
              .pipe(catchError((err)=>{
                console.error(JSON.stringify(err))
                return throwError(()=>err)
              }))
          } else { // this.formMode == 'edit'
            return this.cs.put(`/recipes/${this.recipeId}`, data)
              .pipe(catchError((err)=>{
                console.error(`Error while saving file data to the backend server: ${JSON.stringify(err)}`)
                return throwError(()=>err)
              }))
          }
        }),
        finalize(()=>{
          this.isFormLoading = false
        })
      )
      .subscribe((res:any)=>{
        this.form.reset()
        if (this.formMode == 'add'){
          if (res.id) {
            this.reset()
            this.feedbackService.register('Votre recette a été ajoutée avec succès', 'success')
            this.router.navigate(['/recipe-list'])
          } else {
            this.feedbackService.registerNow('Erreur lors de l\'ajout de la recette', 'danger')
          }
        } else { // this.formMode == 'edit'
          if (res.id) {
            this.reset()
            this.feedbackService.register('Votre recette a été modifiée avec succès', 'success')
            this.router.navigate(['/recipe-list'])
          } else {
            this.feedbackService.registerNow('Erreur lors de la modification de la recette', 'danger')
          }
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

  async promptDelete(){
    let as = await this.asc.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: ()=>{
            this.deleteIsLoading = true
            this.cs.delete(`/recipes/${this.recipeId}`, [] as any)
              .pipe(
                catchError((err)=>{
                  console.error(`Error while deleting recipe: ${JSON.stringify(err)}`)
                  return throwError(()=>err)
                }),
                finalize(()=>{
                  this.deleteIsLoading = false
                })
              )
              .subscribe((res)=>{
                this.feedbackService.register('Recette supprimée avec succès', 'success')
                this.router.navigate(['/recipe-list'])
              })
          }
        },
        {
          text: 'Annuler',
          role: 'cancel',
          handler: ()=>{
          }
        }
      ]})
    await as.present()
  }

  chooseCategory(event:{val:string}){
    this.form.get('category').setValue(event.val)
  }
}
