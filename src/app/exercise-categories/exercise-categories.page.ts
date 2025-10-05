import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface CategoryItem {
  slug: string;
  name: string;
  thumbnailUrl: string | null;
}

@Component({
  selector: 'app-exercise-categories',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Catégories</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="categories-page" *ngIf="categories.length > 0">
        <div class="ion-padding-horizontal">
          <div class="title">
            Catégories d'exercices
          </div>
          <div class="subtitle">
            Choisissez une catégorie pour commencer votre entraînement
          </div>
        </div>

        <!-- The Content -->
        <div class="card-list">
          <div class="tool-card enhanced-tool-card" *ngFor="let category of categories" (click)="navigateToExerciseList(category)">
            <div class="image-container">
              <img [title]="category.name" [src]="category.thumbnailUrl" />
            </div>
            <div class="card-description">
              <div class="spacer"></div>
              <p>Découvrez des exercices adaptés à vos besoins et à votre niveau.</p>
              <h3>{{ category.name }}</h3>
              <ion-button style="align-self: stretch;" expand="block" shape="round">
                Découvrir
              </ion-button>
            </div>
          </div>
        </div>
      </div>



      <!-- Shimmer loading effect while categories are being fetched -->
      <div class="shimmer-container" *ngIf="categories.length === 0">
        <div class="shimmer-content">
          <div class="shimmer-title"></div>
          <div class="shimmer-text shimmer-text-short"></div>
          <div class="shimmer-categories">
            <div class="shimmer-category-button" *ngFor="let i of [1,2,3,4,5]"></div>
          </div>
        </div>
      </div>
      
      <app-button-to-chat></app-button-to-chat>
      <app-bottom-navbar-placeholder></app-bottom-navbar-placeholder>
    </ion-content>
  `,
  styles: [`
    @import '../../mixins';

    .categories-page {
      margin-left: 22px;
      margin-right: 22px;
      margin-bottom: 32px;

      .title {
        font-size: 24px;
        font-weight: 400;
        text-align: center;
        padding-top: 32px;
        margin-top: 0px;
      }

      .subtitle {
        font-size: 16px;
        font-weight: 400;
        line-height: 133%;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 25px;
      }

      .card-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }

    .tool-card {
      @include tool-card;
      margin-bottom: 2rem;
    }

    @media screen and (max-width: 480px) {
      .categories-page {
        margin-left: 1rem;
        margin-right: 1rem;
        gap: 1rem;
      }

      .tool-card {
        @include tool-card-mobile;
      }
    }

    .enhanced-tool-card {
      cursor: pointer;

      .card-description {
        p {
          font-weight: 500;
        }

        h3 {
          font-family: "Shadows Into Light", cursive;
          font-size: 1.5rem!important;
          position: relative;

          &::after {
            content: '';
            display: inline-block;
            height: 2px;
            width: 100%;
            background: linear-gradient(90deg, #b05322ff, #ff8c4200);
            position: absolute;
            left: 0;
            bottom: -10px;
          }
        }

        ion-button {
          @include glassmorphism-button;
          width: 100%;
          margin-top: auto;

          &:active,
          &.ion-activated {
            --background: rgba(0, 0, 0, 0.8) !important;
            --background-activated: rgba(0, 0, 0, 0.8) !important;
            --background-focused: rgba(0, 0, 0, 0.8) !important;
            --color: white !important;
            --color-activated: white !important;
            --color-focused: white !important;
            --ripple-color: rgba(255, 255, 255, 0.3) !important;
            transform: scale(0.98);
            transition: all 0.1s ease;
          }

          .button-native {
            &:active,
            &.ion-activated {
              background: rgba(0, 0, 0, 0.8) !important;
              color: white !important;
            }
          }

          @media (hover: none) and (pointer: coarse) {
            &:hover {
              --background: rgba(255, 255, 255, 0.2);
            }

            &:active {
              --background: rgba(0, 0, 0, 0.8) !important;
              --color: white !important;
            }
          }
        }
      }
    }

    /* Shimmer loading styles */
    .shimmer-container {
      margin-left: 22px;
      margin-right: 22px;
    }

    .shimmer-content {
      padding: 22px 0;
    }

    .shimmer-title {
      height: 24px;
      width: 70%;
      margin: 32px auto 20px auto;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .shimmer-text {
      height: 16px;
      width: 80%;
      margin: 20px auto 25px auto;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .shimmer-text-short {
      width: 60%;
    }

    .shimmer-categories {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .shimmer-category-button {
      height: 60px;
      width: 100%;
      max-width: 500px;
      border-radius: 25px;
      position: relative;
      overflow: hidden;
    }

    .shimmer-title, 
    .shimmer-text, 
    .shimmer-category-button {
      background: var(--ion-color-step-200, #e0e0e0);
    }

    /* Common shimmer animation for all shimmer elements */
    .shimmer-title::after,
    .shimmer-text::after,
    .shimmer-category-button::after {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(var(--ion-background-color-rgb), 0) 0%,
        rgba(var(--ion-background-color-rgb), 0.4) 50%,
        rgba(var(--ion-background-color-rgb), 0) 100%
      );
      animation: shimmerAnimation 1.5s infinite;
    }

    @keyframes shimmerAnimation {
      to {
        transform: translateX(100%);
      }
    }
  `]
})
export class ExerciseCategoriesPage implements OnInit {
  categories: CategoryItem[] = [];
  mainCategory: string = 'training'; // Default value

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Get the category prefix from URL params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.mainCategory = params['category'];
      }
      this.fetchCategories();
    });
  }

  fetchCategories() {
    this.http.get<any>(`${environment.apiEndpoint}/videos/category-hierarchy`).subscribe({
      next: (data) => {
        if (data && data[this.mainCategory]) {
          this.categories = data[this.mainCategory].map((item: [string, string, string]) => {
            return {
              slug: item[0],
              name: item[1],
              thumbnailUrl: item[2] || null
            };
          });
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  navigateToExerciseList(category: CategoryItem | 'all') {
    if (category === 'all') {
      this.router.navigate(['/exercise-list'], { queryParams: { category: 'all' } });
    } else {
      this.router.navigate(['/exercise-list'], { 
        queryParams: { category: `${this.mainCategory}/${category.slug}` } 
      });
    }
  }
}