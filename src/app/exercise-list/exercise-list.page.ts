import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../content.service';
import { FeedbackService } from '../feedback.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';



interface Video {
  id: number;
  title: string;
  description: string;
  tags: string;
  privilege: string[];
  awsUrl: string;
  hlsUrl: string;
  thumbnailUrl: string;
  extra: {
    isExercise: boolean;
    program: string;
    niveau: string;
    duree: string;
    calorie: string;
    materiel: string;
  };
  available: boolean;
}

interface Program {
  name: string;
  category: string;
  videoCount: number;
  videoIds: number[];

  id: number;
  title: string;
  duration: string;
  level: string;
  equipment: string;
  videoUrl: string;
  description: string;
  instructor: string;
  calories: string;
}

interface Exercise {
  id: number;
  name: string;
  icon: string;
  description: string;
  videoUrl: string;
  targetMuscles: string;
  difficulty: string;
  steps: string[];
}

@Component({
  selector: 'app-exercise-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- List View -->
      <div class="exercise-list-page" *ngIf="!selectedExercise && !selectedProgram">
        <div class="ion-padding-horizontal">
          <div class="title" *ngIf="pageTitle">
            {{ pageTitle }}
          </div>
          <div class="title" *ngIf="!pageTitle">
            <ion-spinner></ion-spinner>
          </div>
          <div class="subtitle">
            Choisissez un exercice ou un programme
          </div>
        </div>

        <div class="segment-container">
          <ion-segment [(ngModel)]="selectedSegment" (ionChange)="segmentChanged($event)">
            <ion-segment-button value="exercises">
              <ion-label>Exercices</ion-label>
            </ion-segment-button>
            <ion-segment-button value="programs">
              <ion-label>Programmes</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <div class="content-container">
          <!-- Exercises Tab -->
          <div class="exercises-content" *ngIf="selectedSegment === 'exercises'">

            <!-- Shimering Loading State -->
            <div *ngIf="isLoading" class="shimmer-container exercises-shimmer">
              <div class="shimmer-exercise-item" *ngFor="let i of [1,2,3,4]">
                <div class="shimmer-exercise-icon"></div>
                <div class="shimmer-exercise-info">
                  <div class="shimmer-exercise-name"></div>
                  <div class="shimmer-exercise-description"></div>
                </div>
              </div>
            </div>
          
            <div *ngIf="!isLoading && exercises.length === 0" class="empty-state">
              <ion-icon name="fitness-outline" class="empty-icon"></ion-icon>
              <p>Aucun exercice disponible dans cette catégorie</p>
            </div>
            
            <div class="exercises-list" *ngIf="!isLoading && exercises.length > 0">
              <div class="exercise-item" *ngFor="let exercise of exercises" (click)="openExerciseDetail(exercise)">
                <div class="exercise-icon">
                  <ion-icon name="fitness-outline"></ion-icon>
                </div>
                <div class="exercise-info">
                  <div class="exercise-name">{{ exercise.title }}</div>
                  <div class="exercise-description">
                    {{ exercise.description }}
                  </div>
                </div>
                <ion-icon name="chevron-forward" class="arrow-icon"></ion-icon>
              </div>
            </div>
          </div>

          <!-- Programs Tab -->
          <div class="programs-content" *ngIf="selectedSegment === 'programs'">
            <div *ngIf="isLoading" class="shimmer-container programs-shimmer">
              <div class="shimmer-program-card" *ngFor="let i of [1,2,3]">
                <div class="shimmer-program-header">
                  <div class="shimmer-program-title"></div>
                </div>
                <div class="shimmer-program-info">
                  <div class="shimmer-info-item"></div>
                  <div class="shimmer-info-item"></div>
                </div>
              </div>
            </div>
            
            <div *ngIf="!isLoading && programs.length === 0" class="empty-state">
              <ion-icon name="document-text-outline" class="empty-icon"></ion-icon>
              <p>Aucun programme disponible dans cette catégorie</p>
            </div>
            
            <div class="programs-list" *ngIf="!isLoading && programs.length > 0">
              <div class="program-card" *ngFor="let program of programs" (click)="openProgramDetail(program)">
                <div class="program-header">
                  <div class="program-title">{{ program.name }}</div>
                  <ion-icon name="chevron-forward" class="arrow-icon"></ion-icon>
                </div>
                <div class="program-info">
                  <span class="info-item">
                    <ion-icon name="albums-outline"></ion-icon>
                    {{ program.videoCount }} vidéos
                  </span>
                  <span class="info-item">
                    <ion-icon name="pricetag-outline"></ion-icon>
                    {{ program.category }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Exercise Detail View -->
      <div class="detail-page" *ngIf="selectedExercise">
        <div class="detail-header">
          <ion-button fill="clear" class="back-button" (click)="closeDetail()">
            <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
          </ion-button>
          <h2>{{ selectedExercise.name }}</h2>
        </div>
        
        <div class="video-container">
          <video controls class="exercise-video" poster="/assets/placeholder-video.jpg">
            <source [src]="selectedExercise.videoUrl" type="video/mp4">
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
        
        <div class="detail-content">
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ selectedExercise.description }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Muscles ciblés</h3>
            <p>{{ selectedExercise.targetMuscles }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Niveau de difficulté</h3>
            <p>{{ selectedExercise.difficulty }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Instructions</h3>
            <ol>
              <li *ngFor="let step of selectedExercise.steps">{{ step }}</li>
            </ol>
          </div>
          
          <ion-button expand="block" color="primary" class="action-button">
            Ajouter à mon programme
          </ion-button>
        </div>
      </div>
      
      <!-- Program Detail View -->
      <div class="detail-page" *ngIf="selectedProgram">
        <div class="detail-header">
          <ion-button fill="clear" class="back-button" (click)="closeDetail()">
            <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
          </ion-button>
          <h2>{{ selectedProgram.title }}</h2>
        </div>
        
        <div class="video-container">
          <video controls class="program-video" poster="/assets/placeholder-program.jpg">
            <source [src]="selectedProgram.videoUrl" type="video/mp4">
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
        
        <div class="detail-content">
          <!--<div class="program-metadata">
            <div class="metadata-item">
              <ion-icon name="time-outline"></ion-icon>
              <span>{{ selectedProgram.duration }}</span>
            </div>
            <div class="metadata-item">
              <ion-icon name="fitness-outline"></ion-icon>
              <span>{{ selectedProgram.level }}</span>
            </div>
            <div class="metadata-item">
              <ion-icon name="flame-outline"></ion-icon>
              <span>{{ selectedProgram.calories }}</span>
            </div>
          </div>-->
          
          <div class="detail-section">
            <h3>Description du programme</h3>
            <p>{{ selectedProgram | json }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Coach</h3>
            <div class="coach-info">
              <div class="coach-avatar">
                <ion-icon name="person-circle-outline"></ion-icon>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Équipement nécessaire</h3>
          </div>
          
          <ion-button expand="block" color="primary" class="action-button">
            Commencer l'entraînement
          </ion-button>
        </div>
      </div>
      
      <app-button-to-chat *ngIf="!selectedExercise && !selectedProgram"></app-button-to-chat>
      <app-bottom-navbar-placeholder *ngIf="!selectedExercise && !selectedProgram"></app-bottom-navbar-placeholder>
    </ion-content>
  `,
  styles: [`
    /* List Page Styles */
    .exercise-list-page {
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
      
      .segment-container {
        margin-bottom: 20px;
        
        ion-segment {
          --background: transparent;
          
          ion-segment-button {
            --indicator-color: transparent;
            --color-checked: var(--ion-color-primary);
            --color: var(--ion-color-dark);
            text-transform: none;
            font-size: 16px;
          }
        }
      }
      
      .content-container {
        width: 100%;
        
        .exercises-list {
          background-color: var(--ion-color-light);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          
          .exercise-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            background-color: var(--ion-color-light);
            
            &:last-child {
              border-bottom: none;
            }
            
            .exercise-icon {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background-color: var(--ion-color-primary-tint);
              margin-right: 16px;
              
              ion-icon {
                font-size: 20px;
                color: var(--ion-color-primary);
              }
            }
            
            .exercise-info {
              flex: 1;
              
              .exercise-name {
                color: var(--ion-color-dark);
                font-weight: 500;
                font-size: 16px;
              }
              
              .exercise-description {
                color: var(--ion-color-medium);
                font-size: 14px;
                margin-top: 4px;
              }
            }
            
            .arrow-icon {
              color: var(--ion-color-medium);
              font-size: 18px;
            }
          }
        }
        
        .programs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          
          .program-card {
            background-color: var(--ion-color-light);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            
            .program-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              
              .program-title {
                font-weight: 600;
                font-size: 16px;
                color: var(--ion-color-dark);
              }
              
              .arrow-icon {
                color: var(--ion-color-medium);
                font-size: 18px;
              }
            }
            
            .program-info {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              
              .info-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: var(--ion-color-medium);
                
                ion-icon {
                  margin-right: 4px;
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
    }
    
    /* Detail Page Styles */
    .detail-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .detail-header {
        display: flex;
        align-items: center;
        padding: 16px 22px;
        border-bottom: 1px solid var(--ion-color-light);
        
        .back-button {
          margin-right: 16px;
        }
        
        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
      }
      
      .video-container {
        position: relative;
        width: 100%;
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
        background-color: black;
        
        .exercise-video, .program-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      
      .detail-content {
        padding: 22px;
        
        .program-metadata {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--ion-color-light);
          border-radius: 10px;
          margin-bottom: 20px;
          
          .metadata-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            ion-icon {
              font-size: 24px;
              color: var(--ion-color-primary);
              margin-bottom: 8px;
            }
            
            span {
              font-size: 14px;
              font-weight: 500;
            }
          }
        }
        
        .detail-section {
          margin-bottom: 24px;
          
          h3 {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--ion-color-dark);
          }
          
          p {
            margin: 0;
            color: var(--ion-color-medium);
            line-height: 1.5;
          }
          
          ol {
            padding-left: 20px;
            margin: 0;
            
            li {
              color: var(--ion-color-medium);
              margin-bottom: 8px;
            }
          }
        }
        
        .coach-info {
          display: flex;
          align-items: center;
          
          .coach-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            ion-icon {
              font-size: 36px;
              color: var(--ion-color-medium);
            }
          }
        }
        
        .action-button {
          margin-top: 20px;
          --border-radius: 12px;
          height: 48px;
          font-weight: 500;
          text-transform: none;
        }
      }
    }

    // Styles for UX
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      
      ion-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: var(--ion-color-medium);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      
      .empty-icon {
        font-size: 48px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }
      
      p {
        color: var(--ion-color-medium);
        font-size: 16px;
      }
    }

    /* Shimmer loading styles */
    .shimmer-container {
      width: 100%;
    }

    /* Exercise shimmer styles */
    .exercises-shimmer {
      background-color: var(--ion-color-light);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .shimmer-exercise-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      &:last-child {
        border-bottom: none;
      }
      
      .shimmer-exercise-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 16px;
        position: relative;
        overflow: hidden;
      }
      
      .shimmer-exercise-info {
        flex: 1;
        
        .shimmer-exercise-name {
          height: 16px;
          width: 60%;
          border-radius: 4px;
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-exercise-description {
          height: 12px;
          width: 80%;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
      }
    }

    /* Program shimmer styles */
    .programs-shimmer {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .shimmer-program-card {
      background-color: var(--ion-color-light);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .shimmer-program-header {
        margin-bottom: 12px;
        
        .shimmer-program-title {
          height: 16px;
          width: 70%;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
      }
      
      .shimmer-program-info {
        display: flex;
        gap: 12px;
        
        .shimmer-info-item {
          height: 14px;
          width: 80px;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
      }
    }

    .shimmer-exercise-icon,
    .shimmer-exercise-name,
    .shimmer-exercise-description,
    .shimmer-program-title,
    .shimmer-info-item {
      background: var(--ion-color-step-200, #e0e0e0);
    }

    /* Common shimmer animation for all shimmer elements */
    .shimmer-exercise-icon::after,
    .shimmer-exercise-name::after,
    .shimmer-exercise-description::after,
    .shimmer-program-title::after,
    .shimmer-info-item::after {
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
export class ExerciseListPage implements OnInit {
  categoryName: string = 'Abdos-fessier';
  selectedSegment: string = 'exercises';
  selectedExercise: Exercise | null = null;
  selectedProgram: Program | null = null;
  exercises: Video[] = [];
  programs: Program[] = [];

  // the page title (retrieved from the metainfo)
  pageTitle: string = '';

  // To improve UX
  isLoading = false;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categoryName = params['category'];
        this.loadData(this.categoryName);
      }
    });
  }

  loadData(category: string) {
    this.isLoading = true;
    this.hasError = false;
    
    // Load exercises
    this.http.get(`${environment.apiEndpoint}/videos/exercises-by-category?category=${category}`)
      .subscribe({
        next: (response: any) => {
          this.exercises = response.data || [];
          this.isLoading = false;
          this.pageTitle = response.metainfo.title;
        },
        error: (error) => {
          this.hasError = true;
          this.isLoading = false;
          this.feedbackService.registerNow('Erreur lors du chargement des exercices', 'danger');
        }
      });
    
    // Load programs
    this.http.get(`${environment.apiEndpoint}/videos/programs-by-category?category=${category}`)
      .subscribe({
        next: (response: any) => {
          this.programs = response.data || [];
        },
        error: (error) => {
          this.feedbackService.registerNow('Erreur lors du chargement des programmes', 'danger');
        }
      });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  openExerciseDetail(exercise: any) {
    let videoId = exercise.id;
    this.router.navigateByUrl(`/video-view/${videoId}?mode=exercise`);
    /*this.selectedExercise = {
      id: exercise.id,
      name: exercise.title,
      icon: 'fitness-outline',
      description: exercise.description,
      videoUrl: exercise.hlsUrl || exercise.awsUrl,
      targetMuscles: exercise.extra?.niveau || 'Non spécifié',
      difficulty: exercise.extra?.niveau || 'Non spécifié',
      steps: [exercise.description]
    };
    this.selectedProgram = null;*/
  }

  loadProgramDetails(program: Program) {
    // First load all videos for this program
    this.contentService.get(`/videos/videos-by-program?program=${program.name}`)
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.length > 0) {
            const firstVideo = response.data[0];
            this.selectedProgram = {
              id: firstVideo.id,
              title: program.name,
              duration: firstVideo.extra?.duree || 'Non spécifié',
              level: firstVideo.extra?.niveau || 'Non spécifié',
              equipment: firstVideo.extra?.materiel || 'Non spécifié',
              videoUrl: firstVideo.hlsUrl || firstVideo.awsUrl,
              description: firstVideo.description,
              instructor: firstVideo.user?.name || 'Coach',
              calories: firstVideo.extra?.calorie || 'Non spécifié'
            } as Program;
          } else {
            // Create a placeholder if no videos are found
            this.selectedProgram = {
              id: 0,
              title: program.name,
              duration: 'Non spécifié',
              level: 'Non spécifié',
              equipment: 'Non spécifié',
              videoUrl: '',
              description: 'Aucune information disponible pour ce programme.',
              instructor: 'Coach',
              calories: 'Non spécifié'
            } as Program;
          }
          this.selectedExercise = null;
        },
        error: (error) => {
          this.feedbackService.registerNow('Erreur lors du chargement des détails du programme', 'danger');
        }
      });
  }

  openProgramDetail(program: Program) {
    /*this.selectedProgram = program;
    this.selectedExercise = null;*/
    console.log("Selected program:", program);
    let firstVideoId = program.videoIds[0];
    this.router.navigateByUrl(`/video-view/${firstVideoId}?mode=program`);
  }

  closeDetail() {
    this.selectedExercise = null;
    this.selectedProgram = null;
  }
}