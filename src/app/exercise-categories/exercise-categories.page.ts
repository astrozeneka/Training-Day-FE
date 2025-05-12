import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
      <div class="categories-page">
        <div class="ion-padding-horizontal">
          <div class="title">
            Catégories d'exercices
          </div>
          <div class="subtitle">
            Choisissez une catégorie pour commencer votre entraînement
          </div>
        </div>

        <div class="categories-list">
          <ion-button 
            *ngFor="let category of categories" 
            class="category-button" 
            expand="block" 
            shape="round"
            (click)="navigateToExerciseList(category)"
          >
            {{ category }}
          </ion-button>
          
          <div class="all-exercises">
            <ion-button 
              fill="clear" 
              expand="block"
              (click)="navigateToExerciseList('all')"
            >
              Voir tous les exercices
              <ion-icon name="arrow-forward" slot="end"></ion-icon>
            </ion-button>
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
  `]
})
export class ExerciseCategoriesPage implements OnInit {
  categories: string[] = [
    'Full Body',
    'Abdos-fessier',
    'Épaule Dos',
    'Cuisse Abdos',
    'Hiit',
    'Bras, épaules et pectoraux',
    'Jambes Fessiers'
  ];

  constructor(private router: Router) { }

  ngOnInit() { }

  navigateToExerciseList(category: string) {
    this.router.navigate(['/exercise-list'], { queryParams: { category: category } });
  }
}