import { Component, OnInit } from '@angular/core';
import { FormComponent } from "../../components/form.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ContentService } from "../../content.service";
import { FeedbackService } from "../../feedback.service";
import { catchError, finalize, throwError } from "rxjs";
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { th } from 'date-fns/locale';
import { environment } from 'src/environments/environment';
import { VideoFormService } from 'src/app/video-form.service';

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
        <ion-progress-bar [value]="fileProgress" *ngIf="fileProgress != 0"></ion-progress-bar>
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
        <!-- The category -->
        <ion-item>
          <ion-select
                   formControlName="mainCategory"
                   label="Catégorie principale"
                   label-placement="floating"
                   (ionChange)="onMainCategoryChange($event)"
          >
            <ion-select-option value="">Sélectionner une catégorie</ion-select-option>
            <ion-select-option *ngFor="let category of availableCategories" [value]="category">
                {{getCategoryLabel(category)}}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <!-- The subcategory -->
        <ion-item>
          <ion-select
                  formControlName="subCategory"
                  label="Sous-catégorie"
                  label-placement="floating"
                  (ionChange)="onSubCategoryChange($event)"
                  [disabled]="!form.get('mainCategory').value"
          >
              <ion-select-option value="">Sélectionner une sous-catégorie</ion-select-option>
              <ion-select-option *ngFor="let subCategory of availableSubCategories" [value]="subCategory[0]">
                  {{subCategory[1]}}
              </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
            <ion-select
                formControlName="privilege"
                label="Privilège requis"
                label-placement="floating"
            >
            <ion-select-option value='public,hoylt,gursky,smiley,moreno,alonzo'>Tout le monde</ion-select-option>
            <ion-select-option value='hoylt,gursky,smiley,moreno,alonzo'>Hoylt ou supérieur</ion-select-option>
            <ion-select-option value="gursky,smiley,moreno,alonzo">Gursky/Smiley ou supérieur</ion-select-option>
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

        <!-- IsExercise checkbox -->
        <ion-item>
          <ion-checkbox formControlName="isExercise">Afficher comme exercice</ion-checkbox>
        </ion-item>

        <!-- Program selection -->
        <ion-item>
          <ion-select
            formControlName="program"
            label="Programme"
            label-placement="floating"
            (ionChange)="onProgramChange($event)"
            [disabled]="!form.get('category').value || form.get('category').value === 'undefined'"
          >
            <ion-select-option *ngFor="let option of availableProgramOptions" [value]="option.value">
              {{option.label}}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Custom program input (shown only when "Autres" is selected) -->
        <ion-item *ngIf="showCustomProgram">
          <ion-input
            label="Nom du programme"
            label-placement="floating"
            formControlName="customProgram"
            placeholder="Entrez le nom du programme"
          ></ion-input>
        </ion-item>

        <!-- Metainformation: level -->
        <ion-item>
          <ion-select
            formControlName="level"
            label="Niveau"
            label-placement="floating"
          >
            <ion-select-option value="">Non spécifié</ion-select-option>
            <ion-select-option value="debutant">Débutant</ion-select-option>
            <ion-select-option value="intermediaire">Intermédiaire</ion-select-option>
            <ion-select-option value="avance">Avancé</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Metainformation: duration -->
        <ion-item>
          <ion-input
            type="number"
            label="Durée (minutes)"
            label-placement="floating"
            formControlName="duration"
            placeholder="Durée de l'entraînement en minutes"
          ></ion-input>
        </ion-item>

        <!-- Metainformation: calories -->
        <ion-item>
          <ion-input
            type="number"
            label="Calories"
            label-placement="floating"
            formControlName="calorie"
            placeholder="Calories brûlées estimées"
          ></ion-input>
        </ion-item>

        <!-- Metainformation: equipment -->
        <!--<ion-item>
          <ion-input
            label="Matériel requis"
            label-placement="floating"
            formControlName="material"
            placeholder="Liste du matériel nécessaire"
          ></ion-input>
        </ion-item>-->

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
    'mainCategory': new FormControl('', []),
    'subCategory': new FormControl('', []),
    'category': new FormControl('', []),
    'privilege': new FormControl('public,hoylt,gursky,smiley,moreno,alonzo', []),
    'sort_field': new FormControl('', []),
    'destination': new FormControl<VideoDestination>('s3', [Validators.required]),
    'file': this.fileControl,
    // Required for the 'exercise'/'program' features
    'isExercise': new FormControl(false),
    'program': new FormControl('none'),
    'customProgram': new FormControl(''),

    // new controls for extra_data
    'level': new FormControl('', []),
    'duration': new FormControl('', []),
    'calorie': new FormControl('', []),
    'material': new FormControl('', [])
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

  // TO keep track if the custom program text is displayed
  showCustomProgram:boolean = false;// Store all programs by category

  // Store all programs by category
  programHierarchy: { [category: string]: string[] } = {};
  // Store available program options for the selected category
  availableProgramOptions: { value: string, label: string }[] = [
    { value: 'none', label: 'Pas inclus dans un programme' },
    { value: 'other', label: 'Autres' }
  ];

  // To manage the maincategory/subcategory hierarchy
  // TODO: Refactor this to use a service
  categoryHierarchy: { [category: string]: [string, string][] } = {};
  availableCategories: string[] = [];
  availableSubCategories: [string, string][] = [];


  constructor(
    private router: Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private cs: ContentService,
    private http: HttpClient,
    private vfs: VideoFormService
  ) {
    super();
    this.form.valueChanges.subscribe((value) => {
      this.valid = this.form.valid
    })
  }

  ngOnInit() {

    // Fetch the category hierarchy
    this.vfs.fetchCategoryHierarchy()
      .subscribe((response: any) => {
        this.categoryHierarchy = response;
        this.availableCategories = Object.keys(this.categoryHierarchy);
      })
    
    // Fetch the program hierarchy
    this.vfs.fetchProgramHierarchy()
      .subscribe((response: any) => {
        this.programHierarchy = response;
      });

    // Listen for category changes
    this.form.get('category').valueChanges.subscribe(category => {
      if (category && category.includes('/')) {
        this.updateProgramOptions(category);
      }
    });

    // Disable the program selection by default
    this.form.get('subCategory').disable();
    this.form.get('program').disable();
  }

  submit() {
    this.isFormLoading = true
    let data: any = this.form.value
    if (data.category) {
      data.tags = data.category + ',' + data.tags
    }
    data.file_id = data.file.id
    data.privilege = data.privilege.split(',')

    // Prepare extra_data informations
    let program = data.program;
    if (data.program === 'other' && data.customProgram) {
      program = data.customProgram;
    } else if (data.program === 'none') {
      program = null;
    }
    data.extra = {
      isExercise: data.isExercise || false,
      program: program,

      level: data.level || null,
      duration: data.duration || null,
      calorie: data.calorie || null,
      material: data.material || null
    };

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
                  awsUrl,
                  extra_data: data.extra_data
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
                    // Requesting the server to sync the db with the s3 bucket
                    setTimeout(() => {
                      this.http.post(`${environment.apiEndpoint}/video-s3/sync-v2`, {})
                        .subscribe((res)=>{
                          console.log('S3 bucket synced with the database');
                        })
                    }, 4000);
                  })

              }
            });
        });
    }
  }

  // To manage the program selection
  onProgramChange(event: any) {
    this.showCustomProgram = event.detail.value === 'other';
    if (!this.showCustomProgram) {
      this.form.get('customProgram')?.reset();
    }
  }

  updateProgramOptions(category: string) {
    // Reset the program selection when category changes
    this.form.get('program').setValue('none');
    
    // Reset available options to defaults
    this.availableProgramOptions = [
      { value: 'none', label: 'Pas inclus dans un programme' },
      { value: 'other', label: 'Autres' }
    ];
    
    // If no category or "undefined" is selected, we're done
    if (!category || category === 'undefined') {
      return;
    }
    
    // Get programs for this category
    if (this.programHierarchy[category]) {
      // Add programs from this category to the options
      this.programHierarchy[category].forEach(program => {
        this.availableProgramOptions.splice(this.availableProgramOptions.length - 1, 0, {
          value: program.toLowerCase().replace(/\s+/g, '-'),
          label: program
        });
      });
    }
    
    // For parent categories like "training" or "boxing", also include programs from subcategories
    if (category === 'training' || category === 'boxing') {
      Object.keys(this.programHierarchy).forEach(key => {
        if (key.startsWith(category + '/') && this.programHierarchy[key]) {
          this.programHierarchy[key].forEach(program => {
            // Check if this program already exists in options
            const exists = this.availableProgramOptions.some(
              option => option.value === program.toLowerCase().replace(/\s+/g, '-')
            );
            
            if (!exists) {
              this.availableProgramOptions.splice(this.availableProgramOptions.length - 1, 0, {
                value: program.toLowerCase().replace(/\s+/g, '-'),
                label: program
              });
            }
          });
        }
      });
    }
  }

  // Get display label for main category
  getCategoryLabel(category: string): string {
    // Capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Handle main category change
  onMainCategoryChange(event: any) {
    const selectedCategory = event.detail.value;
    
    // Reset subcategory and program
    this.form.get('subCategory').setValue('');
    this.form.get('program').setValue('none');
    
    // Update available subcategories
    if (selectedCategory && this.categoryHierarchy[selectedCategory]) {
      this.availableSubCategories = this.categoryHierarchy[selectedCategory];
    } else {
      this.availableSubCategories = [];
    }
    
    // If we only have one subcategory, select it automatically
    if (this.availableSubCategories.length === 1) {
      this.form.get('subCategory').setValue(this.availableSubCategories[0][0]);
      this.updateCategoryValue();
    }
  }

  // Handle subcategory change
  onSubCategoryChange(event: any) {
    this.updateCategoryValue();
    
    // Reset and update program selection
    this.form.get('program').setValue('none');
    const mainCategory = this.form.get('mainCategory').value;
    const subCategory = event.detail.value;
    
    if (mainCategory && subCategory) {
      this.updateProgramOptions(`${mainCategory}/${subCategory}`);
    }
  }

  // Update the category value based on main and subcategory
  updateCategoryValue() {
    const mainCategory = this.form.get('mainCategory').value;
    const subCategory = this.form.get('subCategory').value;
    
    if (mainCategory && subCategory) {
      this.form.get('category').setValue(`${mainCategory}/${subCategory}`);
    } else if (mainCategory) {
      this.form.get('category').setValue(mainCategory);
    } else {
      this.form.get('category').setValue('');
    }
  }

}
