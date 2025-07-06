import { Component, OnInit } from '@angular/core';

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

    <app-rounded-card
      [routerLink]="['/app-gps']"
    >
      <div slot="image">
        <img title="GPS" src="../../../assets/medias/IMG_0961_1024x683.jpeg"/>
      </div>
      <div slot="title">
        GPS
      </div>
      <div slot="description">
        Calculez vos kilomètres parcourus avec l'application GPS.
      </div>
    </app-rounded-card>

    <!-- Chronomètre -->
    <app-rounded-card
      [routerLink]="['/app-timer']"
    >
      <div slot="image">
        <img title="GPS" src="../../../assets/medias/IMG_0962_1024x683.jpeg"/>
      </div>
      <div slot="title">
        Chronomètre
      </div>
      <div slot="description">
        Entraînez-vous avec l'application chronomètre réglable pour chaque tour d'entraînement.
      </div>
    </app-rounded-card>

    <!-- Calculateur d'IMC -->
    <app-rounded-card
      [routerLink]="['/app-imc']"
    >
      <div slot="image">
        <img title="IMC" src="../../../assets/medias/imc-stockphoto.png"/>
      </div>
      <div slot="title">
        Calculateur d'IMC
      </div>
      <div slot="description">
        Découvrez notre application calculateur d'IMC pour connaître votre indice de masse corporelle.
      </div>
    </app-rounded-card>

    <!-- Calculateur de calorie -->
    <app-rounded-card
      [routerLink]="['/app-calories']"
    >
      <div slot="image">
        <img title="Calories" src="../../../assets/medias/calory-stockphoto.png"/>
      </div>
      <div slot="title">
        Calculateur de calorie
      </div>
      <div slot="description">
        Découvrez notre application calculateur de calories.
      </div>
    </app-rounded-card>


    <!-- Suivi du poids -->
    <app-rounded-card
      [routerLink]="['/app-weight-tracking']"
    >
      <div slot="image">
        <img title="Suivi du poids" src="../../../assets/medias/weight-tracking-stockphoto.png"/>
      </div>
      <div slot="title">
        Suivi du poids
      </div>
      <div slot="description">
        Découvrez notre application suivi du poids.
      </div>
    </app-rounded-card>
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
    `],
})
export class ToolsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
