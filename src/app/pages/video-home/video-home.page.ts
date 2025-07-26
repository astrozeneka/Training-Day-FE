import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tr } from 'date-fns/locale';
import { ContentService } from 'src/app/content.service';

@Component({
  selector: 'app-video-home',
  template: `<ion-header>
  <ion-toolbar>
      <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>Training</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content id="video-home-content">

  <!-- this is used to invite the user to select login -->
  <div class="faded-cover" *ngIf="!isUserLoggedIn"></div>
  <ion-card class="ion-padding cta" *ngIf="!isUserLoggedIn">
    <ion-card-content>
      <h1 class="display-1">Créer un compte gratuitement pour continuer</h1>
      <br />
      <p class="helper">
        L'enregistrement de votre historique de poids requiert un compte utilisateur.
      </p>
      <br />
      <app-ux-button shape="round" expand="full" routerLink="/login">
        Se connecter
      </app-ux-button>
    </ion-card-content>
  </ion-card>


  <!-- some header here (according to the new theme) -->
  <div class="video-home">
    <div class="ion-padding-horizontal">
      <div class="title">
        Choisi ton Training
      </div>
      <div class="subtitle">
        Ces contenus ont été sélectionnés pour vous aider à progresser dans votre entraînement.
      </div>
    </div>

    <div class="card-list">
      <!-- Training everyday -->
      <div class="tool-card enhanced-tool-card" *ngIf="videoOptions.includes('training')">
        <div class="image-container">
          <img title="Training of the day" src="../../../assets/medias/rounded-cards/sample-image-training-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>Explore des programmes sportifs adaptés à ton niveau et construits autour de tes objectifs personnels.</p>
          <h3>Training of the day</h3>
          <ion-button 
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateToCategory('/exercise-categories', 'training')"
            *ngIf="isUserLoggedIn && !isVideoDisabled"
          >
            Commencer
          </ion-button>
          <ion-button
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateTo('/swipeable-store')"
            color="warning"
            *ngIf="isUserLoggedIn && isVideoDisabled"
          >
            Choisir mon abonnement
          </ion-button>
          <ion-button 
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateTo('/login')"
            *ngIf="!isUserLoggedIn"
          >
            Se connecter
          </ion-button>

        </div>
      </div>

      <div class="tool-card enhanced-tool-card" *ngIf="videoOptions.includes('boxing')">
        <div class="image-container">
          <img title="Boxing of the day" src="../../../assets/medias/rounded-cards/sample-image-boxing-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>De l'initiation aux entraînements avancés, progresse en boxe selon tes objectifs personnels.</p>
          <h3>Boxing of the day</h3>
          <ion-button 
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateToCategory('/exercise-categories', 'boxing')"
            *ngIf="isUserLoggedIn && !isVideoDisabled"
          >
            Commencer
          </ion-button>
          <ion-button
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateTo('/swipeable-store')"
            color="warning"
            *ngIf="isUserLoggedIn && isVideoDisabled"
          >
            Choisir mon abonnement
          </ion-button>
          <ion-button 
            style="align-self: stretch;" 
            expand="block" 
            (click)="navigateTo('/login')"
            *ngIf="!isUserLoggedIn"
          >
            Se connecter
          </ion-button>
        </div>
      </div>
    </div>
  </div>
  
  <app-button-to-chat></app-button-to-chat>
  <app-bottom-navbar-placeholder></app-bottom-navbar-placeholder>
</ion-content>
`,
  styles: [`

  @import '../../../mixins';

// Card container mixin (used in mixins.scss as well)
@mixin card-container {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  background: var(--ion-color-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

// Gradient overlay mixin
@mixin gradient-overlay {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

// Glassmorphism button mixin (same as in mixins.scss)
@mixin glassmorphism-button {
  --background: rgba(255, 255, 255, 0.2);
  --color: white;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  --padding-start: 1.2rem;
  --padding-end: 1.2rem;
  --padding-top: 0.6rem;
  --padding-bottom: 0.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  
  &:hover {
    --background: rgba(255, 255, 255, 0.3);
  }
}

  .video-home{
    .title{
        font-size: 24px;
        font-weight: 400;
        text-align: center;
        padding-top: 32px;
        margin-top: 0px;
    }
    
    .subtitle{
        font-size: 16px;
        font-weight: 400;
        line-height: 133%;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 25px;
    }


    
    margin-left: 22px; 
    margin-right: 22px;
    margin-bottom: 32px;

    & .card-list{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}

.tool-card {
  @include tool-card;
  // Specific to 'video-home' page only
  & {
    margin-bottom: 2rem;
  }


}
// WARNING, the code is duplicated with tools and in recipes
.enhanced-tool-card {
  & .card-description {
    & p {
      font-weight: 500;
    }
    & h3{
      font-family: "Shadows Into Light", cursive;
      font-size: 1.5rem!important ;
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
    // A button (similar to in the tools.page)
    & ion-button {
      @include glassmorphism-button;
      width: 100%; // Full-width as requested
      margin-top: auto; // Push button to bottom

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

      & .button-native {
        &:active,
        &.ion-activated {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
        }
      }
  
      // Ensure no hover effects interfere on touch devices
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

// Mobile responsiveness
@media screen and (max-width: 480px) {
  .video-home {
    margin-left: 1rem;
    margin-right: 1rem;
    gap: 1rem;
  }
  
  .tool-card {
    @include tool-card-mobile;
  }
}


// The login cta
#video-home-content {
  position: relative;
  .faded-cover {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
      background-color: var(--ion-color-light)cc;
      &>* {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }
  }

  .cta {
      z-index: 101;
      color: var(--ion-color-dark);
      margin: 0 !important;
      /* Put it centered */
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      width: 80%;
  }
}

`]
})
export class VideoHomePage implements OnInit {

  isVideoDisabled = true; // ONly available for premium users
  isUserLoggedIn = false;

  videoOptions = []

  constructor(
    private router: Router,
    private contentService: ContentService
  ) { }

  ngOnInit() {

    // Load user data
    this.loadUserData();
  }

  navigateToCategory(route: string, category: string) {
    this.router.navigate([route], { queryParams: { category: category } });
  }

  // Load user data from the content service
  private loadUserData() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      if (!user) {
        this.isUserLoggedIn = false;
      } else if (user.renewable_id == null){
        this.isUserLoggedIn = true;
        this.isVideoDisabled = true;
      } else if (user.renewable_id == 'hoylt' && !user.user_settings['training_option']) {
        // Navigate to the training program selection page
        this.router.navigate(['/training-program-selection']);
      } else if (user.renewable_id == 'hoylt' && user.user_settings['training_option']) {
        this.videoOptions = [user.user_settings['training_option']];
        this.isUserLoggedIn = true;
        this.isVideoDisabled = false;
      } else { // For higher renewable_id users
        this.videoOptions = ['training', 'boxing']; // Default options
        this.isUserLoggedIn = true;
        this.isVideoDisabled = false;
      }
    });
  }

  public navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
