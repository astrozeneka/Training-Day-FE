import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface CategoryItem {
  slug: string;
  name: string;
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
        <div class="categories-list">
          <ion-button 
            *ngFor="let category of categories" 
            class="category-button" 
            expand="block" 
            shape="round"
            (click)="navigateToExerciseList(category)"
          >
            {{ category.name }}
          </ion-button>
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
      
      .categories-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        
        .category-button {
          max-width: 500px;
          width: 100%;
          margin: 0;
          --border-radius: 25px;
          font-weight: 500;
          height: 50px;
          text-transform: none;
        }
        
        .all-exercises {
          margin-top: 24px;
          width: 100%;
          max-width: 500px;
          border-top: 1px solid var(--ion-color-lightgrey);
          padding-top: 15px;
          
          ion-button {
            color: var(--ion-color-primary);
            text-transform: none;
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
      background: #e0e0e0;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .shimmer-text {
      height: 16px;
      width: 80%;
      margin: 20px auto 25px auto;
      background: #e0e0e0;
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
      height: 50px;
      width: 100%;
      max-width: 500px;
      background: #e0e0e0;
      border-radius: 25px;
      position: relative;
      overflow: hidden;
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
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.6) 50%,
        rgba(255, 255, 255, 0) 100%
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
          this.categories = data[this.mainCategory].map((item: [string, string]) => {
            return {
              slug: item[0],
              name: item[1]
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