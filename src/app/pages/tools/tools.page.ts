import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tools',
  template: `<ion-header>
  <ion-toolbar>
      <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>Les accessoires</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="tools">
    <div class="ion-padding-horizontal">
      <div class="title">
        Découvez les outils d'entraînement
      </div>
      <div class="subtitle">
        Ces outils permettront de vous aider à vous entraîner et à suivre vos progrès.
      </div>
    </div>

    <!-- Calculateur d'IMC -->
    <div class="tool-card enhanced-tool-card" (click)="navigateTo('/app-imc')">
      <div class="image-container">
        <img title="IMC" src="../../../assets/medias/imc-stockphoto.png" />
      </div>
      <div class="card-description">
        <div class="spacer"></div>
        <p>Découvrez notre application calculateur d'IMC pour connaître votre indice de masse corporelle.</p>
        <h3>Calculateur d'IMC</h3>
        <ion-button class="tool-button" expand="block" (click)="navigateTo('/app-imc')">
          Commencer
        </ion-button>
      </div>
    </div>


    <!-- Suivi du poids -->
    <div class="tool-card enhanced-tool-card" (click)="navigateTo('/app-weight-tracking')">
      <div class="image-container">
        <img title="Suivi du poids" src="../../../assets/medias/weight-tracking-stockphoto.png" />
      </div>
      <div class="card-description">
        <div class="spacer"></div>
        <p>Découvrez notre application suivi du poids.</p>
        <h3>Suivi du poids</h3>
        <ion-button class="tool-button" expand="block" (click)="navigateTo('/app-weight-tracking')">
          Commencer
        </ion-button>
      </div>
    </div>

    <!-- Calculateur de calorie -->
    <div class="tool-card enhanced-tool-card" (click)="navigateTo('/app-calories')">
      <div class="image-container">
        <img title="Calories" src="../../../assets/medias/calory-stockphoto.png" />
      </div>
      <div class="card-description">
        <div class="spacer"></div>
        <p>Découvrez notre application calculateur de calories.</p>
        <h3>Calculateur de calorie</h3>
        <ion-button class="tool-button" expand="block" (click)="navigateTo('/app-calories')">
          Commencer
        </ion-button>
      </div>
    </div>

    <div class="tool-card enhanced-tool-card" (click)="navigateTo('/app-gps')">
      <div class="image-container">
        <img title="GPS" src="../../../assets/medias/IMG_0961_1024x683.jpeg" />
      </div>
      <div class="card-description">
        <div class="spacer"></div>
        <p>Calculez vos kilomètres parcourus avec l'application GPS.</p>
        <h3>Course</h3>
        <ion-button class="tool-button" expand="block" (click)="navigateTo('/app-gps')">
          Commencer
        </ion-button>
      </div>
    </div>

    <!-- Chronomètre -->
    <div class="tool-card enhanced-tool-card" (click)="navigateTo('/app-timer')">
      <div class="image-container">
        <img title="Chronomètre" src="../../../assets/medias/IMG_0962_1024x683.jpeg" />
      </div>
      <div class="card-description">
        <div class="spacer"></div>
        <p>Entraînez-vous avec l'application chronomètre réglable pour chaque tour d'entraînement.</p>
        <h3>Chronomètre</h3>
        <ion-button class="tool-button" expand="block" (click)="navigateTo('/app-timer')">
          Commencer
        </ion-button>
      </div>
    </div>
    
  </div>

  <app-button-to-chat></app-button-to-chat>
  <app-bottom-navbar-placeholder></app-bottom-navbar-placeholder>
</ion-content>
`,
  styles: [`

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

.tools{
    margin-left: 22px; 
    margin-right: 22px;
    margin-bottom: 32px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

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

.tools {
  margin-left: 22px; 
  margin-right: 22px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; // Add spacing between cards
}

.tool-card {
  @include card-container;
  position: relative;
  height: 320px; // Increased height as requested
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
      flex-grow: 1; // Spacer to push content to the bottom
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
  .tools {
    margin-left: 1rem;
    margin-right: 1rem;
    gap: 1rem;
  }
  
  .tool-card {
    height: 280px; // Slightly smaller on mobile but still taller than original
    
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

    `],
})
export class ToolsPage implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

}
