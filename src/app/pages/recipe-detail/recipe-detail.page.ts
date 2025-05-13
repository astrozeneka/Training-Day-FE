import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { catchError, distinctUntilChanged, tap, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { Recipe, RecipesService } from 'src/app/recipes.service';

@Component({
  selector: 'app-recipe-detail',
  template: `<ion-header>
  <ion-toolbar>
      <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>{{ recipe ? recipe.title : "Recette"}}</ion-title>
      <ion-buttons slot="end" *ngIf="user?.function === 'admin' || user?.function === 'coach' || user?.function === 'nutritionist'">
        <ion-button (click)="editRecipe()">
          Modifier
        </ion-button>
      </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content fullscreen="true" [scrollEvents]="true" (ionScroll)="onScroll($event)">
  <!-- The media container -->
  <div class="pdf-container" *ngIf="docUrl">
    <img [src]="docUrl" class="doc-image">
  </div>

  <!-- Floating action button to scroll to details -->
  <div class="floating-info-button-container" [class.hidden]="!showInfoButton">
    <ion-button 
      class="floating-info-button" 
      (click)="scrollToDetails()" 
      size="small"
      expand="block"
      *ngIf="docUrl && recipe?.extra">
      <span>Voir les informations</span>
      <ion-icon name="arrow-down" slot="end"></ion-icon>
    </ion-button>
  </div>

  <!-- Loading spinner while the document is being fetched -->
  <div class="spinner" *ngIf="!docUrl">
    <ion-spinner></ion-spinner>
  </div>

  <!-- Metadata -->
  <div class="detail-content" id="detail-section" *ngIf="recipe?.extra">
    <div class="recipe-metadata" *ngIf="recipe.extra.time || recipe.extra.difficulty || recipe.extra.calories || recipe.extra.servings">
      <div class="metadata-item" *ngIf="recipe.extra.time">
        <ion-icon name="time-outline"></ion-icon>
        <span>{{ recipe.extra.time }}</span>
      </div>
      <div class="metadata-item" *ngIf="recipe.extra.difficulty">
        <ion-icon name="fitness-outline"></ion-icon>
        <span>{{ recipe.extra.difficulty }}</span>
      </div>
      <div class="metadata-item" *ngIf="recipe.extra.calories">
        <ion-icon name="flame-outline"></ion-icon>
        <span>{{ recipe.extra.calories }}</span>
      </div>
      <div class="metadata-item" *ngIf="recipe.extra.servings">
        <ion-icon name="people-outline"></ion-icon>
        <span>{{ recipe.extra.servings }}</span>
      </div>
    </div>
    
    <div class="detail-section" *ngIf="recipe.extra.description">
      <h3>Description</h3>
      <p>{{ recipe.extra.description }}</p>
    </div>
    
    <div class="detail-section" *ngIf="recipe.extra.ingredients && recipe.extra.ingredients.length > 0">
      <h3>Ingrédients</h3>
      <ul class="ingredients-list">
        <li *ngFor="let ingredient of recipe.extra.ingredients">{{ ingredient }}</li>
      </ul>
    </div>
    
    <div class="detail-section" *ngIf="recipe.extra.instructions && recipe.extra.instructions.length > 0">
      <h3>Instructions</h3>
      <ol>
        <li *ngFor="let instruction of recipe.extra.instructions">{{ instruction }}</li>
      </ol>
    </div>
    
    <div class="detail-section" *ngIf="recipe.extra.preparationTime || recipe.extra.cookingTime">
      <h3>Temps de préparation</h3>
      <p *ngIf="recipe.extra.preparationTime">Préparation: {{ recipe.extra.preparationTime }}</p>
      <p *ngIf="recipe.extra.cookingTime">Cuisson: {{ recipe.extra.cookingTime }}</p>
    </div>
  </div>
</ion-content>
`,
  styles: [`
    html, body, ion-app, ion-content {
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .pdf-container{
        height: 100% !important;
        background: rgba(128, 128, 128, 0.136); // to remove
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        & .doc-image{
            width: 100%;
            max-width: 600px;
        }
    }

    .spinner{
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .detail-content {
      padding: 22px;
      background-color: var(--ion-color-light);
      
      .recipe-metadata {
        display: flex;
        justify-content: space-between;
        padding: 16px;
        background-color: var(--ion-color-light);;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        
        .metadata-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          
          ion-icon {
            font-size: 24px;
            color: var(--ion-color-primary);
            margin-bottom: 8px;
          }
          
          span {
            font-size: 14px;
            font-weight: 500;
            text-align: center;
          }
        }
      }
      
      .detail-section {
        margin-bottom: 24px;
        
        h3 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--ion-color-dark);
        }
        
        p {
          margin: 0;
          color: var(--ion-color-medium);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        
        ul.ingredients-list {
          list-style: none;
          padding-left: 0;
          margin: 0;
          
          li {
            color: var(--ion-color-medium);
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
            
            &:before {
              content: "•";
              position: absolute;
              left: 0;
              color: var(--ion-color-primary);
            }
          }
        }
        
        ol {
          padding-left: 20px;
          margin: 0;
          
          li {
            color: var(--ion-color-medium);
            margin-bottom: 12px;
            line-height: 1.5;
          }
        }
      }
    }

    // About the floating action button
    .floating-info-button-container {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999;
      transition: all 0.3s ease-in-out;
      opacity: 1;
      
      &.hidden {
        opacity: 0;
        transform: translateX(-50%) translateY(100px);
        pointer-events: none;
      }
    }

    .floating-info-button {
      --background: var(--ion-color-primary);
      --background-activated: var(--ion-color-primary-shade);
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      --border-radius: 24px;
      --padding-start: 20px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      font-weight: 500;
      min-width: 180px;
      
      span {
        margin-right: 8px;
      }
      
      ion-icon {
        font-size: 18px;
        animation: bounce 2s infinite;
      }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-5px);
      }
      60% {
        transform: translateY(-3px);
      }
    }
  `]
})

export class RecipeDetailPage implements OnInit {

  // Recipe information
  recipeId: number = null
  recipe: Recipe = null
  docUrl: SafeResourceUrl

  // User data
  user: User = null

  // Properties required by the dynamic "Voir les informations" button
  @ViewChild(IonContent, { static: false }) content: IonContent;
  showInfoButton = true;
  private scrollThreshold = 100;

  constructor(
    public router: Router,
    public cs: ContentService,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private rs: RecipesService,
    private http: HttpClient
  ) {
    this.recipeId = parseInt(this.route.snapshot.paramMap.get('id'))
    this.rs.onRecipeDetail(this.recipeId)
      .pipe(
        tap((data: Recipe) => {
          this.recipe = data
        }),
        distinctUntilChanged((a, b) => a.docSmallPhoneUrl === b.docSmallPhoneUrl && a.docLargePhoneUrl === b.docLargePhoneUrl && a.docTabletUrl === b.docTabletUrl)
      )
      .subscribe((data: Recipe) => {
        console.log(data)
        if (data.docLargePhoneUrl) {
          if (data.docLargePhoneBase64)
            this.docUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.docLargePhoneBase64)
          else
            this.docUrl = data.docLargePhoneUrl
        }
      })
  }

  /**
   * May be used later for caching
   * @param buffer 
   * @returns 
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * May be used later for caching
   * @param blob 
   */
  convertBlobToBase64(blob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // Read the blob as a data URL (base64)
    console.log(`Loading blob the blob with FileReader`);
    reader.onload = () => { // Sometimes it use onloadend (idk)
      const base64data = reader.result as string;
      // Mark the base64 URL as safe for use in an iframe
      console.log(`base64 generated ${base64data.length} characters`);
      // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64data);
      // set cache here ....
    };
    reader.onerror = (error) => {
      console.error('Error converting blob to base64:', error);
    };
  }

  ngOnInit() {
    // Load the user information
    this.cs.userStorageObservable.getStorageObservable().subscribe((res) => {
      this.user = res
    })

  }

  editRecipe() {
    this.router.navigate(['/edit-recipe/', this.recipeId])
  }

  // Required by  Scroll to the details section
  ionViewWillEnter() {
    this.showInfoButton = true;
  }

  // Add the scroll handler method:
  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    const shouldShow = scrollTop < this.scrollThreshold;
    
    if (this.showInfoButton !== shouldShow) {
      this.showInfoButton = shouldShow;
      this.cdr.detectChanges();
    }
  }

  // Scroll to the details section
  scrollToDetails() {
    if (this.content) {
      const detailSection = document.getElementById('detail-section');
      if (detailSection) {
        this.content.scrollToPoint(0, detailSection.offsetTop, 500);
      }
    }
  }
}
