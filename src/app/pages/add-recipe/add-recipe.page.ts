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
  template: `
  <ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <app-back-button></app-back-button>
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>Ajouter une recette</ion-title>
    <ion-progress-bar [value]="progress" *ngIf="progress"></ion-progress-bar>
  </ion-toolbar>
</ion-header>

<ion-content>
  <h1 class="display-1 ion-padding">Ajouter une recette</h1>
  <form [formGroup]="form" (submit)="submit()">

    <!-- ion-item is deprecated and will be removed later -->
    <div class="input-wrapper">
      <app-outline-input label="Titre" formControlName="title" [errorText]="displayedError.title"></app-outline-input>
    </div>
    <!--<ion-item>
      <ion-input
        label="Titre"
        label-placement="floating"
        formControlName="title"
        [errorText]="displayedError.title"
      ></ion-input>
    </ion-item>-->

    <!-- Will be changed to text area later (not now) -->
    <div class="input-wrapper">
      <app-outline-input label="Description" formControlName="description"
        [errorText]="displayedError.description"></app-outline-input>
    </div>

    <!--<ion-item>
      <ion-textarea
              label="Description"
              label-placement="floating"
              formControlName="description"
              [rows]="5"
              [errorText]="displayedError.description"
      ></ion-textarea>
    </ion-item>-->

    <div class="input-wrapper">
      <app-outline-input label="Catégorie" formControlName="category"
        [errorText]="displayedError.category"></app-outline-input>
      <div class="chip-list">
        <ion-chip *ngFor="let c of categories" (click)="chooseCategory({val:c})"
          [color]="c === form.get('category').value ? 'primary' : 'medium'">{{ c }}</ion-chip>
      </div>
    </div>

    <!-- Image picker -->
    <div class="image-picker-wrapper">
      <div class="label">
        Image représentative
      </div>
      <app-image-picker color="light" label="Image" accept="image/png,image/jpeg" formControlName="image"
        [errorText]="displayedError.image"></app-image-picker>
    </div>

    <!-- PDF pickers -->
    <div class="image-picker-wrapper">
      <div class="label">
        Visuel pour petit smartphone (facult.)
      </div>
      <app-image-picker color="light" label="Sélectionner un fichier" accept="image/png,image/jpeg,image/tiff"
        formControlName="docSmallPhone" [errorText]="displayedError.docSmallPhone" mode="image"></app-image-picker>
    </div>

    <!-- PDF pickers -->
    <div class="image-picker-wrapper">
      <div class="label">
        Visuel pour smartphone
      </div>
      <app-image-picker color="light" label="Sélectionner un fichier" accept="image/png,image/jpeg,image/tiff"
        formControlName="docLargePhone" [errorText]="displayedError.docLargePhone" mode="image"></app-image-picker>
    </div>

    <!-- PDF pickers -->
    <div class="image-picker-wrapper">
      <div class="label">
        Visuel pour tablette (facult.)
      </div>
      <app-image-picker color="light" label="Sélectionner un fichier" accept="image/png,image/jpeg,image/tiff"
        formControlName="docTablet" [errorText]="displayedError.docTablet" mode="image"></app-image-picker>
    </div>

    <div class="section-header">
      <h3>Informations supplémentaires</h3>
    </div>

    <div class="input-wrapper">
      <app-outline-input label="Description détaillée" formControlName="extra_description"
        [errorText]="displayedError.extra_description"></app-outline-input>
    </div>

    <div class="input-row">
      <div class="input-wrapper half-width">
        <app-outline-input label="Temps total" formControlName="extra_time"
          [errorText]="displayedError.extra_time"></app-outline-input>
      </div>
      <div class="input-wrapper half-width">
        <app-outline-input label="Calories" formControlName="extra_calories"
          [errorText]="displayedError.extra_calories"></app-outline-input>
      </div>
    </div>

    <div class="input-row">
      <div class="input-wrapper half-width">
        <app-outline-input label="Difficulté" formControlName="extra_difficulty"
          [errorText]="displayedError.extra_difficulty"></app-outline-input>
      </div>
      <div class="input-wrapper half-width">
        <app-outline-input label="Portions" formControlName="extra_servings"
          [errorText]="displayedError.extra_servings"></app-outline-input>
      </div>
    </div>

    <div class="input-row">
      <div class="input-wrapper half-width">
        <app-outline-input label="Temps de préparation" formControlName="extra_preparationTime"
          [errorText]="displayedError.extra_preparationTime"></app-outline-input>
      </div>
      <div class="input-wrapper half-width">
        <app-outline-input label="Temps de cuisson" formControlName="extra_cookingTime"
          [errorText]="displayedError.extra_cookingTime"></app-outline-input>
      </div>
    </div>

    <!-- The code below have a lot of bug -->
    <!--
    <div class="input-wrapper">
      <div class="label">Ingrédients</div>
      <div class="list-manager">
        <ion-button fill="clear" size="small" (click)="addIngredient()">
          <ion-icon name="add-circle-outline" slot="start"></ion-icon>
          Ajouter un ingrédient
        </ion-button>
        <div class="list-items">
          <div class="list-item" *ngFor="let ingredient of ingredientsList; let i = index">
            <ion-input [(ngModel)]="ingredientsList[i]" [ngModelOptions]="{standalone: true}"
              placeholder="Ex: 200g de farine"></ion-input>
            <ion-button fill="clear" size="small" (click)="removeIngredient(i)">
              <ion-icon name="close-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </div>

    <div class="input-wrapper">
      <div class="label">Instructions</div>
      <div class="list-manager">
        <ion-button fill="clear" size="small" (click)="addInstruction()">
          <ion-icon name="add-circle-outline" slot="start"></ion-icon>
          Ajouter une instruction
        </ion-button>
        <div class="list-items">
          <div class="list-item" *ngFor="let instruction of instructionsList; let i = index">
            <span class="step-number">{{ i + 1 }}.</span>
            <ion-input [(ngModel)]="instructionsList[i]" [ngModelOptions]="{standalone: true}"
              placeholder="Décrivez l'étape"></ion-input>
            <ion-button fill="clear" size="small" (click)="removeInstruction(i)">
              <ion-icon name="close-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </div>
    -->

    <div class="controls">
      <app-ux-button expand="block" [disabled]="!valid" shape="round" [loading]="isFormLoading"
        *ngIf="formMode=='add'">Ajouter</app-ux-button>
      <app-ux-button expand="block" [disabled]="!valid" shape="round" [loading]="isFormLoading"
        *ngIf="formMode=='edit'">Mettre à jour</app-ux-button>
      <app-ux-button *ngIf="formMode == 'edit'" type="button" expand="block" fill="clear" color="danger"
        (click)="promptDelete()" [loading]="deleteIsLoading">Supprimer</app-ux-button>
    </div>
  </form>
</ion-content>
  `,
  styles: [`


.image-picker-wrapper,
app-outline-input{
    --margin-top: 22px;
    --margin-bottom: 22px;
    --border-color: #858585;
    margin-top: 22px;
    margin-bottom: 22px;
}

form{
    padding-left: 24px;
    padding-right: 24px;
}

.label{
    font-size: 14px;
    color: #79747E;
    margin-bottom: 8px;
    display: block;
}

.chip-list{
    margin-top: -16px;
    margin-bottom: 8px;
}

/* For the extra information */
.section-header {
  margin: 32px 0 16px 0;
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    color: var(--ion-color-dark);
  }
}

.input-row {
  display: flex;
  gap: 16px;
  
  .half-width {
    flex: 1;
  }
}

.list-manager {
  .list-items {
    margin-top: 8px;
  }
  
  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    ion-input {
      flex: 1;
      --background: var(--ion-color-light);
      --padding-start: 12px;
      --padding-end: 12px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      border-radius: 8px;
    }
    
    .step-number {
      font-weight: 500;
      color: var(--ion-color-medium);
      min-width: 20px;
    }
  }
}
  `]
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

    // For the extra informations
    'extra_description': new FormControl(''),
    'extra_time': new FormControl(''),
    'extra_calories': new FormControl(''),
    'extra_difficulty': new FormControl(''),
    'extra_servings': new FormControl(''),
    'extra_preparationTime': new FormControl(''),
    'extra_cookingTime': new FormControl(''),
    'extra_ingredients': new FormControl([]), // Array of ingredients
    'extra_instructions': new FormControl([]), // Array of instructions
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'category': undefined,
    'image': undefined,
    'docSmallPhone': undefined,
    'docLargePhone': undefined,
    'docTablet': undefined,

    // For the extra informations
    'extra_description': undefined,
    'extra_time': undefined,
    'extra_calories': undefined,
    'extra_difficulty': undefined,
    'extra_servings': undefined,
    'extra_preparationTime': undefined,
    'extra_cookingTime': undefined,
    'extra_ingredients': undefined,
    'extra_instructions': undefined,
  }
  valid: boolean = false;
  isFormLoading: boolean = false

  // Progress value
  progress: number = 0

  // Form mode
  formMode: 'add' | 'edit' = 'add';
  recipeId: number = undefined; // In case of formMode == 'edit' only

  // Delete button loading
  deleteIsLoading: boolean = false

  // Category list to improve User experience
  categories: string[] = []


  constructor(
    private router: Router,
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
    this.form.statusChanges.subscribe((status) => {
      this.valid = status === 'VALID'
    })

    // Handle the form mode
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd && (event.url.includes('add-recipe') || event.url.includes('edit-recipe'))),
        tap((event: NavigationEnd) => {
          if (this.router.url.includes('add-recipe')) {
            this.formMode = 'add'
          } else if (this.router.url.includes('edit-recipe')) {
            this.formMode = 'edit'
            this.recipeId = parseInt(this.router.url.split('/').pop())
          }
        }),
        filter((event: NavigationEnd) => event.url.includes('edit-recipe')),
        switchMap(() => {
          // IF the mode is edit, load recipe data (using recipe-service)
          return this.rs.onRecipeDetail(this.recipeId, true, true)
        })
      )
      .subscribe((res: Recipe) => {
        // Image filling
        let imagePlaceholder = {
          image: res.imageUrl ? { name: res.imageUrl.split('/').pop(), isPlaceholder: true } : undefined,
          docSmallPhone: res.docSmallPhoneUrl ? { name: res.docSmallPhoneUrl.split('/').pop(), isPlaceholder: true } : undefined,
          docLargePhone: res.docLargePhoneUrl ? { name: res.docLargePhoneUrl.split('/').pop(), isPlaceholder: true } : undefined,
          docTablet: res.docTabletUrl ? { name: res.docTabletUrl.split('/').pop(), isPlaceholder: true } : undefined
        }

        // Load extra data if available
        let extraData = {};
        if (res.extra) {
          extraData = {
            extra_description: res.extra.description || '',
            extra_time: res.extra.time || '',
            extra_calories: res.extra.calories || '',
            extra_difficulty: res.extra.difficulty || '',
            extra_servings: res.extra.servings || '',
            extra_preparationTime: res.extra.preparationTime || '',
            extra_cookingTime: res.extra.cookingTime || '',
            extra_ingredients: res.extra.ingredients || [],
            extra_instructions: res.extra.instructions || []
          };
          
          // Populate the lists for UI
          this.ingredientsList = res.extra.ingredients || [];
          this.instructionsList = res.extra.instructions || [];
        }

        this.form.patchValue({ ...res, ...imagePlaceholder })
      })

    // Load the category information
    this.rs.onCategoryData(true, true).subscribe((data: string[]) => {
      this.categories = data
    })
  }

  _loadedFiles = {}
  updateFileUploadProgress(loaded: number, total: number, slug: string, fileNumber: number) {
    console.log(loaded, total, slug)
    this._loadedFiles[slug] = [loaded, total, fileNumber]
    // If the total number of key == fileNumber
    if (Object.keys(this._loadedFiles).length === fileNumber) {
      let loaded = 0
      let total = 0
      for (let key in this._loadedFiles) {
        loaded += this._loadedFiles[key][0]
        total += this._loadedFiles[key][1]
      }
      this.progress = loaded / total
      console.log(`Progress: ${this.progress}`)
      this.cdr.detectChanges()
    }
  }

  submitFile(url, file: { name: string, type: string, blob: any }, slug: string) {
    return this.cs.getOne(url, { filename: file.name, filetype: file.type })
      .pipe(
        catchError((err) => {
          console.error(err)
          return throwError(() => err)
        }),
        switchMap((res: { url: string }) => {
          const fileData = file.blob ? file.blob : file
          const req = new HttpRequest('PUT', res.url, fileData, {
            headers: new HttpHeaders({
              'Content-Type': file.type
            }),
            reportProgress: true,
          });
          console.log(JSON.stringify(req))
          return this.http.request(req)
            .pipe(
              catchError((err) => {
                console.error(JSON.stringify(err))
                return throwError(() => err)
              }),
              map((event) => {
                console.log("Here", JSON.stringify(res))
                return { ...event, slug }
              })
            )
        })
      )
  }

  reset() {
    this.form.reset()
    this.form.get('image')?.setValue(null)
    this.form.get('docSmallPhone')?.setValue(null)
    this.form.get('docLargePhone')?.setValue(null)
    this.form.get('docTablet')?.setValue(null)

    // Reset extra fields
    this.form.get('extra_ingredients')?.setValue([]);
    this.form.get('extra_instructions')?.setValue([]);
    this.ingredientsList = [];
    this.instructionsList = [];

    this.progress = 0;
  }

  submit() {
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
    if (fileUploaders.length === 0) {
      if (this.formMode == 'add') {
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
        catchError((err) => {
          // Error can be simulated later
          console.error(`Error while uploading file : ${JSON.stringify(err)}`)
          return throwError(() => err)
        }),
        tap((res: { type, slug, url }) => { // URL is only available if res.type == Response
          if (res.type === HttpEventType.UploadProgress) {
            if (!files.includes(res.slug)) {
              files.push(res.slug)
            }
            this.updateFileUploadProgress((res as any).loaded, (res as any).total, res.slug, fileUploaders.length)
          }
          if (res.type === HttpEventType.Response && files.includes(res.slug)) {
            files = files.filter((slug) => slug !== res.slug)
            urls[res.slug] = res.url.split('?')[0]
          }
        }),
        filter((res: { type: HttpEventType, slug: string }) => {
          return res.type === HttpEventType.Response && files.length === 0
        }),
        /*,*/
        // Upload to the server using the traditionnal POST endpoint for uploading video
        switchMap((res: any) => {
          let data = {
            title: this.form.value.title,
            description: this.form.value.description,
            category: this.form.value.category,
            //imageUrl: urls['image'] ?? '',
            //docLargePhoneUrl: urls['docLargePhone'] ?? null,
            // Optional fields
            ...(urls['image'] ? { imageUrl: urls['image'] } : {}),
            ...(urls['docLargePhone'] ? { docLargePhoneUrl: urls['docLargePhone'] } : {}),
            ...(urls['docSmallPhone'] ? { docSmallPhoneUrl: urls['docSmallPhone'] } : {}),
            ...(urls['docTablet'] ? { docTabletUrl: urls['docTablet'] } : {}),

            // The extra informations
            extra: {
              description: this.form.value.extra_description || undefined,
              time: this.form.value.extra_time || undefined,
              calories: this.form.value.extra_calories || undefined,
              difficulty: this.form.value.extra_difficulty || undefined,
              servings: this.form.value.extra_servings || undefined,
              preparationTime: this.form.value.extra_preparationTime || undefined,
              cookingTime: this.form.value.extra_cookingTime || undefined,
              ingredients: this.form.value.extra_ingredients?.filter(item => item) || undefined,
              instructions: this.form.value.extra_instructions?.filter(item => item) || undefined
            }
          }
          data.extra = Object.entries(data.extra)
            .filter(([_, v]) => v !== undefined)
            .reduce((obj, [k, v]) => {
              obj[k] = v;
              return obj;
            }, {}) as any;
          if (Object.keys(data.extra).length === 0) {
            delete data.extra;
          } 


          console.log(data)
          if (this.formMode === 'add') {
            return this.cs.post('/recipes', data)
              .pipe(catchError((err) => {
                console.error(JSON.stringify(err))
                return throwError(() => err)
              }))
          } else { // this.formMode == 'edit'
            return this.cs.put(`/recipes/${this.recipeId}`, data)
              .pipe(catchError((err) => {
                console.error(`Error while saving file data to the backend server: ${JSON.stringify(err)}`)
                return throwError(() => err)
              }))
          }
        }),
        finalize(() => {
          this.isFormLoading = false
        })
      )
      .subscribe((res: any) => {
        this.form.reset()
        if (this.formMode == 'add') {
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

  async promptDelete() {
    let as = await this.asc.create({
      'header': 'Action',
      'buttons': [
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.deleteIsLoading = true
            this.cs.delete(`/recipes/${this.recipeId}`, [] as any)
              .pipe(
                catchError((err) => {
                  console.error(`Error while deleting recipe: ${JSON.stringify(err)}`)
                  return throwError(() => err)
                }),
                finalize(() => {
                  this.deleteIsLoading = false
                })
              )
              .subscribe((res) => {
                this.feedbackService.register('Recette supprimée avec succès', 'success')
                this.router.navigate(['/recipe-list'])
              })
          }
        },
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    })
    await as.present()
  }

  chooseCategory(event: { val: string }) {
    this.form.get('category').setValue(event.val)
  }

  // Required by the extra informations
  ingredientsList: string[] = [];
  instructionsList: string[] = [];

  // Add these methods
  addIngredient() {
    this.ingredientsList.push('');
    this.form.get('extra_ingredients').setValue([...this.ingredientsList]);
  }

  removeIngredient(index: number) {
    this.ingredientsList.splice(index, 1);
    this.form.get('extra_ingredients').setValue([...this.ingredientsList]);
  }

  addInstruction() {
    this.instructionsList.push('');
    this.form.get('extra_instructions').setValue([...this.instructionsList]);
  }

  removeInstruction(index: number) {
    this.instructionsList.splice(index, 1);
    this.form.get('extra_instructions').setValue([...this.instructionsList]);
  }
}
