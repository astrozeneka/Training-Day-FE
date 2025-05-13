import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Program {
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
        <ion-title>{{ categoryName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- List View -->
      <div class="exercise-list-page" *ngIf="!selectedExercise && !selectedProgram">
        <div class="ion-padding-horizontal">
          <div class="title">
            {{ categoryName }}
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
            <div class="exercises-list">
              <div class="exercise-item" *ngFor="let exercise of exercises" (click)="openExerciseDetail(exercise)">
                <div class="exercise-icon">
                  <ion-icon [name]="exercise.icon"></ion-icon>
                </div>
                <div class="exercise-info">
                  <div class="exercise-name">{{ exercise.name }}</div>
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
            <div class="programs-list">
              <div class="program-card" *ngFor="let program of programs" (click)="openProgramDetail(program)">
                <div class="program-header">
                  <div class="program-title">{{ program.title }}</div>
                  <ion-icon name="chevron-forward" class="arrow-icon"></ion-icon>
                </div>
                <div class="program-info">
                  <span class="info-item">
                    <ion-icon name="time-outline"></ion-icon>
                    {{ program.duration }}
                  </span>
                  <span class="info-item">
                    <ion-icon name="fitness-outline"></ion-icon>
                    {{ program.level }}
                  </span>
                  <span class="info-item">
                    <ion-icon name="barbell-outline"></ion-icon>
                    {{ program.equipment }}
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
          <div class="program-metadata">
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
          </div>
          
          <div class="detail-section">
            <h3>Description du programme</h3>
            <p>{{ selectedProgram.description }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Coach</h3>
            <div class="coach-info">
              <div class="coach-avatar">
                <ion-icon name="person-circle-outline"></ion-icon>
              </div>
              <span>{{ selectedProgram.instructor }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Équipement nécessaire</h3>
            <p>{{ selectedProgram.equipment }}</p>
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
            --indicator-color: var(--ion-color-primary);
            --color-checked: var(--ion-color-light);
            --color: var(--ion-color-medium);
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
  `]
})
export class ExerciseListPage implements OnInit {
  categoryName: string = 'Abdos-fessier';
  selectedSegment: string = 'exercises';
  selectedExercise: Exercise | null = null;
  selectedProgram: Program | null = null;

  exercises: Exercise[] = [
    {
      id: 1,
      name: 'Crunch',
      icon: 'fitness-outline',
      description: 'Renforce les abdominaux supérieurs',
      videoUrl: '/assets/videos/crunch.mp4',
      targetMuscles: 'Abdominaux supérieurs, rectus abdominis',
      difficulty: 'Débutant',
      steps: [
        'Allongez-vous sur le dos, genoux pliés et pieds à plat sur le sol.',
        'Placez vos mains derrière la tête ou croisées sur la poitrine.',
        'Contractez vos abdominaux pour soulever les épaules du sol.',
        'Expirez en montant et inspirez en descendant lentement.',
        'Maintenez la tension abdominale pendant tout l\'exercice.'
      ]
    },
    {
      id: 2,
      name: 'Planche',
      icon: 'body-outline',
      description: 'Stabilisation du corps et gainage',
      videoUrl: '/assets/videos/plank.mp4',
      targetMuscles: 'Abdominaux, dos, épaules, fessiers',
      difficulty: 'Intermédiaire',
      steps: [
        'Placez vos avant-bras au sol, coudes sous les épaules.',
        'Étendez vos jambes derrière vous, soulevez votre corps.',
        'Maintenez une ligne droite des talons à la tête.',
        'Gardez les abdominaux engagés et le dos neutre.',
        'Respirez normalement et tenez la position.'
      ]
    },
    {
      id: 3,
      name: 'Squat',
      icon: 'barbell-outline',
      description: 'Renforce les jambes et les fessiers',
      videoUrl: '/assets/videos/squat.mp4',
      targetMuscles: 'Quadriceps, fessiers, ischio-jambiers',
      difficulty: 'Débutant',
      steps: [
        'Tenez-vous debout, pieds écartés largeur des épaules.',
        'Poussez vos hanches vers l\'arrière et pliez les genoux.',
        'Descendez comme pour vous asseoir sur une chaise.',
        'Gardez la poitrine haute et le dos droit.',
        'Poussez à travers vos talons pour remonter.'
      ]
    },
    {
      id: 4,
      name: 'Fentes',
      icon: 'walk-outline',
      description: 'Travail isolé des jambes',
      videoUrl: '/assets/videos/lunges.mp4',
      targetMuscles: 'Quadriceps, fessiers, ischio-jambiers',
      difficulty: 'Intermédiaire',
      steps: [
        'Tenez-vous droit, pieds écartés largeur des hanches.',
        'Faites un grand pas en avant avec une jambe.',
        'Abaissez le corps jusqu\'à ce que les deux genoux soient pliés à 90°.',
        'Gardez le torse droit et le genou avant aligné avec la cheville.',
        'Poussez sur le talon avant pour revenir en position initiale.'
      ]
    },
    {
      id: 5,
      name: 'Relevé de bassin',
      icon: 'body-outline',
      description: 'Cible les fessiers et le bas du dos',
      videoUrl: '/assets/videos/hip-thrust.mp4',
      targetMuscles: 'Fessiers, lombaires, ischio-jambiers',
      difficulty: 'Débutant',
      steps: [
        'Allongez-vous sur le dos, genoux pliés et pieds à plat sur le sol.',
        'Placez les bras le long du corps, paumes vers le bas.',
        'Contractez les fessiers et soulevez le bassin vers le haut.',
        'Formez une ligne droite des genoux aux épaules au sommet.',
        'Abaissez lentement le bassin et répétez.'
      ]
    },
    {
      id: 6,
      name: 'Mountain Climber',
      icon: 'speedometer-outline',
      description: 'Cardio et renforcement abdominal',
      videoUrl: '/assets/videos/mountain-climber.mp4',
      targetMuscles: 'Abdominaux, épaules, hanches',
      difficulty: 'Intermédiaire',
      steps: [
        'Commencez en position de pompe, bras tendus.',
        'Ramenez un genou vers la poitrine, tout en gardant l\'autre jambe tendue.',
        'Alternez rapidement les jambes comme si vous couriez.',
        'Gardez le dos droit et les abdominaux engagés.',
        'Maintenez un rythme régulier et contrôlé.'
      ]
    }
  ];

  programs: Program[] = [
    {
      id: 1,
      title: 'Programme 1: Abdos de fer',
      duration: '30 min',
      level: 'Débutant',
      equipment: 'Sans matériel',
      videoUrl: '/assets/videos/abs-program.mp4',
      description: 'Ce programme complet cible tous les groupes musculaires abdominaux pour un renforcement efficace. Idéal pour les débutants souhaitant développer leur force abdominale et améliorer leur posture. Séance complète avec échauffement et retour au calme.',
      instructor: 'Marie Dupont',
      calories: '250 kcal'
    },
    {
      id: 2,
      title: 'Programme 2: Fessiers toniques',
      duration: '25 min',
      level: 'Intermédiaire',
      equipment: 'Avec élastique',
      videoUrl: '/assets/videos/glutes-program.mp4',
      description: 'Programme spécifique pour sculpter et tonifier les fessiers. Combinaison d\'exercices ciblés avec et sans élastique pour maximiser l\'activation musculaire. Idéal pour ceux qui cherchent à renforcer cette zone spécifique du corps.',
      instructor: 'Thomas Martin',
      calories: '280 kcal'
    },
    {
      id: 3,
      title: 'Programme 3: Challenge 7 jours',
      duration: '20 min/jour',
      level: 'Tous niveaux',
      equipment: 'Matériel minimal',
      videoUrl: '/assets/videos/7day-challenge.mp4',
      description: 'Relevez ce défi de 7 jours pour transformer votre silhouette! Chaque jour propose un entraînement différent mais complémentaire pour des résultats visibles. Programme progressif adapté à tous avec options pour débutants et avancés.',
      instructor: 'Sophie Legrand',
      calories: '200-300 kcal/jour'
    },
    {
      id: 4,
      title: 'Programme 4: Intensif HIIT',
      duration: '15 min',
      level: 'Avancé',
      equipment: 'Sans matériel',
      videoUrl: '/assets/videos/hiit-abs.mp4',
      description: 'Séance courte mais intense combinant exercices abdominaux et cardio pour une combustion maximale des graisses. Alternance d\'exercices à haute intensité et de courtes périodes de récupération. Idéal pour ceux qui recherchent l\'efficacité en un minimum de temps.',
      instructor: 'Alex Bernard',
      calories: '350 kcal'
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categoryName = params['category'];
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  openExerciseDetail(exercise: Exercise) {
    this.selectedExercise = exercise;
    this.selectedProgram = null;
  }

  openProgramDetail(program: Program) {
    this.selectedProgram = program;
    this.selectedExercise = null;
  }

  closeDetail() {
    this.selectedExercise = null;
    this.selectedProgram = null;
  }
}