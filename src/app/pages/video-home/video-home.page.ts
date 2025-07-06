import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

<ion-content>
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
      <div class="tool-card">
        <div class="image-container">
          <img title="Training of the day" src="../../../assets/medias/rounded-cards/sample-image-training-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>Explore des programmes sportifs adaptés à ton niveau et construits autour de tes objectifs personnels.</p>
          <h3>Training of the day</h3>
          <ion-button style="align-self: stretch;" expand="block" shape="round" (click)="navigateToCategory('/exercise-categories', 'training')">
            Découvrir
          </ion-button>
        </div>
      </div>

      <div class="tool-card">
        <div class="image-container">
          <img title="Boxing of the day" src="../../../assets/medias/rounded-cards/sample-image-boxing-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>De l'initiation aux entraînements avancés, progresse en boxe selon tes objectifs personnels.</p>
          <h3>Boxing of the day</h3>
            <ion-button style="align-self: stretch;" expand="block" shape="round" (click)="navigateToCategory('/exercise-categories', 'boxing')">
              Découvrir
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

// Card container mixin
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

// Glassmorphism button mixin
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
  @include card-container;
  position: relative;
  height: 320px;
  width: 100%;
  
  .image-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.9) contrast(1.1);
    }
  }
  
  .card-description {
    @include gradient-overlay;
    padding: 3rem 1.5rem 1.5rem;
    text-align: left;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);

    & .spacer {
      flex-grow: 1;
    }
    
    p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0 0 1rem 0;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    }
    
    h3 {
      color: white;
      margin: 0 0 1.5rem 0;
      font-size: 1.4rem;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    
    .tool-button {
      @include glassmorphism-button;
      width: 100%;
      margin-top: auto;
      
      // Override the active state for touch devices
      &:active,
      &.ion-activated {
        --background: rgba(0, 0, 0, 0.8) !important;
        --background-activated: rgba(0, 0, 0, 0.8) !important;
        --color: white !important;
        --color-activated: white !important;
        transform: scale(0.98);
        transition: all 0.1s ease;
      }
      
      // Disable native iOS button styling
      -webkit-appearance: none !important;
      -webkit-tap-highlight-color: transparent !important;
      
      // Target the native button element inside ion-button
      & .button-native {
        &:active,
        &.ion-activated {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
        }
      }
    }
  }

  // Specific to 'video-home' page only
  & {
    margin-bottom: 2rem;
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
    height: 280px;
    
    .card-description {
      padding: 2.5rem 1rem 1rem;
      
      h3 {
        font-size: 1.2rem;
      }
      
      p {
        font-size: 0.9rem;
      }
    }
  }
}

`]
})
export class VideoHomePage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  navigateToCategory(route: string, category: string) {
    this.router.navigate([route], { queryParams: { category: category } });
  }

}
