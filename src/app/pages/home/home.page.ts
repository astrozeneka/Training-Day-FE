import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContentService } from "../../content.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

// import { register } from 'swiper/element/bundle';
import { FormComponent } from "../../components/form.component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FeedbackService } from "../../feedback.service";
import { environment } from "../../../environments/environment";
import { Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import Store from 'src/app/custom-plugins/store.plugin';



@Component({
  selector: 'app-home',
  template: `
<div class="welcome-header ion-padding">
    <div class="greeting-section">

        <ion-menu-button *ngIf="user?.function === 'admin' || user?.function === 'coach' || user?.function === 'coach'"></ion-menu-button>
        <h1 class="greeting-title" *ngIf="user">Bonjour, {{ user.firstname }}</h1>
        <h1 class="greeting-title" *ngIf="!user">Bienvenue sur Training Day</h1>
        <div class="streak-counter" *ngIf="false">
            <ion-icon name="flame"></ion-icon>
            <span class="streak-number">7</span>
            <span class="streak-label">jours</span>
        </div>
    </div>
</div>

<ion-content>

    <div *ngIf="user">
        <ion-card color="warning" class="ion-padding"
            *ngIf="user.trial_is_active && !(user.subscription_is_active || (user.grouped_perishables && user.grouped_perishables['sport-coach']) || (user.grouped_perishables && user.grouped_perishables['food-coach']))">
            Vous disposez d'un essai gratuit de {{ getRemainingTrialDays(user.trial_expires_at) }} jours. Profitez-en
            pour discuter avec votre coach.
            L'essai se terminera le {{ user.trial_expires_at | date:'dd MMMM yyyy' }}.
        </ion-card>
    </div>
    <div>

        <div *ngIf="user?.appointments?.length > 0">
            <h1 class="display-1 ion-padding">Mes rendez-vous</h1>
            <ion-card color="warning ion-padding" class="appointment-card"
                *ngFor="let appointment of user.appointments">
                <ion-icon name="calendar"></ion-icon>
                <div>
                    Vous avez un rendez-vous planifié le
                    <b>
                        {{ appointment.datetime | date:'dd MMMM yyyy' }}
                    </b>
                    à
                    <b>
                        {{ appointment.datetime | date:'HH:mm' }}
                    </b>

                    <br />
                    <b>Motif :</b> {{ appointment.reason }}<br />

                </div>
            </ion-card>
        </div>

        <!-- Fullscreen search overlay -->
        <div class="search-overlay" [class.active]="isSearchActive" (click)="onSearchBlur()">
        </div>

        <!-- Functional search section -->
        <div class="search-section ion-padding" [class.search-active]="isSearchActive">
          <div class="search-container" [class.search-focused]="isSearchActive">
            <ion-icon name="search" class="search-icon"></ion-icon>
            <input 
              type="text" 
              placeholder="Rechercher un exercice, un programme..." 
              class="search-input"
              [formControl]="searchControl"
              (focus)="onSearchFocus()"
              (blur)="onSearchBlur()">
            <ion-icon name="options" class="filter-icon" *ngIf="!isSearchActive"></ion-icon>
            <ion-icon name="close" class="close-icon" *ngIf="isSearchActive" (click)="onSearchBlur()"></ion-icon>
          </div>

          <!-- Search Results Container -->
          <div class="search-results-container" 
            [class.fullscreen]="isSearchActive"
            *ngIf="showSearchResults">
            <!-- Loading State -->
            <div class="search-loading" *ngIf="isSearching">
              <ion-spinner></ion-spinner>
              <span>Recherche en cours...</span>
            </div>

            <!-- Results -->
            <div class="search-results" *ngIf="!isSearching && searchResults">
              <!-- No Results -->
              <div class="no-results" *ngIf="!searchResults.videos?.length && !searchResults.recipes?.length && !searchResults.applinks?.length">
                <ion-icon name="search"></ion-icon>
                <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
              </div>

              <!-- Results List -->
              <div class="results-list" *ngIf="searchResults.videos?.length || searchResults.recipes?.length || searchResults.applinks?.length">
                <!-- Videos -->
                <div class="result-item" 
                  *ngFor="let video of searchResults.videos" 
                  (click)="onSearchResultClick(video)">
                  <div class="result-icon">
                    <ion-icon [name]="getResultIcon(video.entity)"></ion-icon>
                  </div>
                  <div class="result-content">
                    <h4 class="result-title">{{ video.title }}</h4>
                    <p class="result-description">{{ video.description }}</p>
                    <span class="result-type">Vidéo</span>
                  </div>
                  <div class="result-thumbnail" *ngIf="video.thumbnailUrl">
                    <img [src]="video.thumbnailUrl" [alt]="video.title">
                  </div>
                </div>

                <!-- Recipes -->
                <div class="result-item" 
                  *ngFor="let recipe of searchResults.recipes" 
                  (click)="onSearchResultClick(recipe)">
                  <div class="result-icon">
                      <ion-icon [name]="getResultIcon(recipe.entity)"></ion-icon>
                  </div>
                  <div class="result-content">
                    <h4 class="result-title">{{ recipe.title }}</h4>
                    <p class="result-description">{{ recipe.description }}</p>
                    <span class="result-type">Recette</span>
                  </div>
                  <div class="result-thumbnail" *ngIf="recipe.thumbnailUrl">
                    <img [src]="recipe.thumbnailUrl" [alt]="recipe.title">
                  </div>
                </div>

                <!-- App Links -->
                <div class="result-item" 
                  *ngFor="let applink of searchResults.applinks" 
                  (click)="onSearchResultClick(applink)">
                  <div class="result-icon">
                    <ion-icon [name]="getResultIcon(applink.entity)"></ion-icon>
                  </div>
                  <div class="result-content">
                    <h4 class="result-title">{{ applink.title }}</h4>
                    <p class="result-description">{{ applink.description }}</p>
                    <span class="result-type">Application</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- The applications section -->
        <div class="section-header ion-padding">
          <h2 class="section-title">Mes Applications</h2>
          <span class="voir-plus" (click)="navigateTo('/tools')">Voir plus</span>
        </div>

        <!-- Swiper container for the apps -->
        <div class="container">
            <swiper-container navigation="false" pagination="true" css-mode="false" loop="false" slides-per-view="1.2" space-between="16" centered-slides="false" #swiperEl init="true">
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/IMG_0962_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Entraînez-vous avec l'application chronomètre réglable pour chaque tour d'entraînement.
                        </p>
                        <h3>
                            <span>Chronomètre</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-timer')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/IMG_0961_1024x683.jpeg" />
                    </div>
                    <div class="description">
                        <p>
                            Calculez vos kilomètres parcourus avec l'application GPS.
                        </p>
                        <h3>
                            <span>Course</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-gps')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="GPS" src="../../../assets/medias/imc-stockphoto.png" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application calculateur d'IMC pour connaître votre indice de masse
                            corporelle.
                        </p>
                        <h3>
                            <span>Calculateur d'IMC</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-imc')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="Calories" src="../../../assets/medias/calory-stockphoto.png" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application calculateur de calories.
                        </p>
                        <h3>
                            <span>Calculateur de calories</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-calories')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
                <swiper-slide>
                    <div class="image-container">
                        <img title="Suivi du poids" src="../../../assets/medias/weight-tracking-stockphoto.png" />
                    </div>
                    <div class="description">
                        <p>
                            Découvrez notre application suivi du poids.
                        </p>
                        <h3>
                            <span>Suivi du poids</span>
                        </h3>
                        <ion-button (click)="navigateTo('/app-weight-tracking')">Découvrir</ion-button>
                    </div>
                </swiper-slide>
            </swiper-container>
        </div>

        <!-- CTA section to talk with the coach -->
        <div class="chat-cta-section ion-padding">
          <div class="chat-cta-container">
            <div class="chat-cta-content">
              <ion-icon name="chatbubbles" class="chat-icon"></ion-icon>
              <div class="chat-text">
                <h3>Besoin d'aide ?</h3>
                <p>Parlez à votre coach personnel</p>
              </div>
            </div>
            <ion-button class="chat-button" (click)="navigateTo('/messenger-master')">
                Commencer la discussion
            </ion-button>
          </div>
        </div>

        <div class="training-section">
          <div class="section-header ion-padding">
              <h2 class="section-title">S'entraîner</h2>
              <span class="voir-plus" (click)="navigateTo('/video-home')">Voir plus</span>
          </div>

          <div class="training-cta-section ion-padding">
            <div class="training-cta-container">
              <div class="training-cta-content">
                <div class="cta-icon-container">
                  <ion-icon name="fitness" class="training-icon"></ion-icon>
                </div>
                <div class="training-text">
                  <h3>Commencez votre entraînement</h3>
                  <p>Découvrez nos programmes personnalisés et vidéos d'exercices</p>
                </div>
              </div>
              <div class="training-features">
                <div class="feature-item">
                  <ion-icon name="play-circle" color="light"></ion-icon>
                  <span>Vidéos HD</span>
                </div>
                <div class="feature-item">
                  <ion-icon name="timer" color="light"></ion-icon>
                  <span>Programmes adaptés</span>
                </div>
                <div class="feature-item">
                  <ion-icon name="trophy" color="light"></ion-icon>
                  <span>Suivi des progrès</span>
                </div>
              </div>
              <ion-button class="training-button" (click)="navigateTo('/video-home')">
                Explorer les entraînements
              </ion-button>
            </div>
          </div>
          
          <!--<div class="chip-selector ion-padding-horizontal">
              <ion-chip class="training-chip active">Tout</ion-chip>
              <ion-chip class="training-chip">Cardio</ion-chip>
              <ion-chip class="training-chip">Musculation</ion-chip>
              <ion-chip class="training-chip">Yoga</ion-chip>
              <ion-chip class="training-chip">HIIT</ion-chip>
          </div>
          
          <div class="training-videos ion-padding-horizontal">
              <div class="training-video-card" *ngFor="let workout of videos">
                  <div class="video-thumbnail">
                      <img [src]="workout.thumbnail" [alt]="workout.title">
                      <div class="play-overlay">
                          <ion-icon name="play"></ion-icon>
                      </div>
                      <div class="duration-badge">{{ workout.duration }}</div>
                  </div>
                  <div class="video-info">
                      <h4 class="video-title">{{ workout.title }}</h4>
                      <div class="video-stats">
                          <span class="difficulty">{{ workout.difficulty }}</span>
                          <span class="calories">{{ workout.calories }} cal</span>
                      </div>
                  </div>
              </div>
          </div>-->
      </div>

    </div>


    <div class="premium-subscription-redesigned">
      <div class="section-header ion-padding">
        <h2 class="section-title">Profiter des avantages</h2>
      </div>
      <div class="subscription-card ion-padding">
          <div class="subscription-header">
              <!--<ion-icon name="star" class="premium-icon"></ion-icon>-->
              <!-- Icon of the app -->
              <img src="/assets/logo-dark-cropped.png" width="64" alt="Training Day Logo" class="premium-icon" />
              <h2>Optez pour un abonnement</h2>
          </div>
          <p class="subscription-description">
              Débloquez des programmes personnalisés et un suivi avec votre coach
          </p>
          <div class="premium-features">
              <div class="feature-item">
                  <ion-icon name="checkmark-circle" color="success"></ion-icon>
                  <span>Programmes personnalisés</span>
              </div>
              <div class="feature-item">
                  <ion-icon name="checkmark-circle" color="success"></ion-icon>
                  <span>Coach personnel dédié</span>
              </div>
              <div class="feature-item">
                  <ion-icon name="checkmark-circle" color="success"></ion-icon>
                  <span>Suivi en temps réel</span>
              </div>
          </div>
          <ion-button class="premium-button" (click)="navigateTo('/swipeable-store')">
              Accéder à la boutique
          </ion-button>
      </div>
    </div>

    <div class="">
        <h1 class="display-1 ion-padding">Découvrez les nouvelles actualités sportifs sur Training-Day</h1>
        <div class="list-container">
            <div class="video-card ion-padding" *ngFor="let video of videos">
                <div class="left" (click)="goToVideo(video.id)">
                    <img src="/assets/logo-light-1024x1024-noalpha.jpg" alt="Vidéo thumbnail" class="card-image"
                        *ngIf="!video.thumbnail" />
                    <img [src]="getUrl(video.thumbnail.permalink)" alt="Vidéo thumbnail" class="card-image"
                        *ngIf="video.thumbnail" />
                    <ion-icon name="play-circle-outline"></ion-icon>
                </div>
                <div class="right">
                    <h3 class="card-title" (click)="goToVideo(video.id)">{{ video['title'] }}</h3>
                    <!--<div class="stars">
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                            <ion-icon name="star-outline"></ion-icon>
                        </div>-->
                    <p>{{ video['description'] }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Replace the existing "Autres astuces et conseils" section with this -->
    <div class="tips-section">
      <div class="section-header ion-padding">
        <h2 class="section-title">Astuces et conseils</h2>
        <span class="voir-plus" (click)="navigateTo('/tips')">Voir plus</span>
      </div>

      <!-- Swiper container for tips -->
      <div class="container">
        <swiper-container navigation="false" pagination="true" css-mode="false" loop="false" 
                          slides-per-view="1.1" space-between="16" centered-slides="false" 
                          autoplay="true" autoplay-delay="4000" #tipsSwiperEl init="true">
          
          <swiper-slide>
            <div class="image-container">
              <img title="Les calories" src="../../../assets/medias/plat-bol-bouddha-legumes-legumineuses-vue-dessus-1024x683.jpeg" />
            </div>
            <div class="tip-content">
              <h3>Les calories</h3>
              <p class="tip-excerpt">
                Chaque jour, votre corps a besoin d'énergie pour fonctionner et accomplir correctement ses missions.
              </p>
              <div class="tip-details" [class.expanded]="expandedTips['calories']">
                <p>
                  La calorie est une unité de mesure de l'énergie couramment utilisée en nutrition. Par habitude, 
                  on évoque nos besoins journaliers en "calories", mais il s'agit en fait de kilocalories (kcal). 
                  1 kilocalorie = 1 000 calories.
                </p>
              </div>
              <ion-button class="tip-button" (click)="toggleTip('calories')">
                {{ expandedTips['calories'] ? 'Réduire' : 'En savoir plus' }}
              </ion-button>
            </div>
          </swiper-slide>

          <swiper-slide>
            <div class="image-container">
              <img title="Rééquilibrage alimentaire" src="../../../assets/medias/femme-active-mesurant-sa-taille-1024x767.jpeg" />
            </div>
            <div class="tip-content">
              <h3>Rééquilibrage alimentaire</h3>
              <p class="tip-excerpt">
                Dans notre société sédentaire, où l'abondance et la consommation effrénée sont les maîtres-mots.
              </p>
              <div class="tip-details" [class.expanded]="expandedTips['reequilibrage']">
                <p>
                  Dans un tel contexte, il peut être difficile de se repérer parmi les informations qui nous parviennent 
                  continuellement. « 5 fruits et légumes par jour », « 10000 pas par jour », « limiter les aliments gras, 
                  salés, sucrés » : tout le monde connaît ces messages de santé publique.
                </p>
              </div>
              <ion-button class="tip-button" (click)="toggleTip('reequilibrage')">
                {{ expandedTips['reequilibrage'] ? 'Réduire' : 'En savoir plus' }}
              </ion-button>
            </div>
          </swiper-slide>

        </swiper-container>
      </div>
    </div>

    <!-- Autres contenus -->
    <!--<div>
        <h1 class="display-1 ion-padding">Autres astuces et conseils</h1>
        <div class="misc-list">
            <div class="misc-item">
                <img title="Les calories" sr
                    c="../../../assets/medias/plat-bol-bouddha-legumes-legumineuses-vue-dessus-1024x683.jpeg"
                    style="scale: 2.8">
                <div class="ion-padding">
                    <h3 class="display-1">Les calories</h3>
                    <p>
                        Chaque jour, votre corps a besoin d’énergie pour fonctionner et accomplir correctement ses
                        missions. Cette énergie nous est fournie par les aliments que nous consommons et s’exprime en
                        calories.
                        <br />
                    </p>
                    <p>
                        <span #calory id="calory">
                            La calorie est une unité de mesure de l’énergie couramment utilisée en nutrition. Par
                            habitude, on évoque nos besoins journaliers en "calories", mais il s'agit en fait de
                            kilocalories (kcal). 1 kilocalorie = 1 000 calories.
                        </span>
                        <ion-button (click)="toggleContent(calory, $event)">
                            Plus
                        </ion-button>
                    </p>
                </div>
            </div>
            <div class="misc-item">
                <img title="Rééquilibrage alimentaire"
                    src="../../../assets/medias/femme-active-mesurant-sa-taille-1024x767.jpeg" style="scale: 2.8">
                <div class="ion-padding">
                    <h3 class="display-1">Rééquilibrage alimentaire</h3>
                    <p>
                        Dans notre société sédentaire, où l'abondance et la consommation effrénée sont les maîtres-
                        mots, chacun d'entre nous est constamment sollicité par les médias par des discours
                        contradictoires.
                        <br />
                    </p>
                    <p>
                        <span #reequilibrage id="reequilibrage">
                            Dans un tel contexte, il peut être difficile de se repérer parmi les informations qui nous
                            parviennent continuellement. « 5 fruits et légumes par jour », « 10000 pas par jour », «
                            limiter les aliments gras, salés, sucrés » : tout le monde connaît ces messages de santé
                            publique. Pour autant, il n'est pas toujours aisé de les mettre en œuvre au quotidien.
                        </span>
                        <ion-button (click)="toggleContent(reequilibrage, $event)">
                            Plus
                        </ion-button>
                    </p>
                </div>
            </div>
        </div>
        
            <div>
                <h2 class="display-1 ion-padding-horizontal">Debug section</h2>
                <div>
                    {{ token }}
                </div>
                <div>
                    <ion-button fill="clear" (click)="unvalidateToken()">Unvalidate token</ion-button>
                </div>
                <div>
                    <ion-button fill="clear" (click)="refreshToken()">Refresh token</ion-button>
                </div>
            </div>
        <br />
        <br />
        <br />
        <br />
        <br />
    </div>-->

    <div class="share-section ion-padding">
      <div class="share-container">
        <div class="share-content">
          <ion-icon name="share-social" class="share-icon"></ion-icon>
          <div class="share-text">
            <h3>Partagez Training Day</h3>
            <p>Invitez vos amis à vous rejoindre</p>
          </div>
        </div>
        <ion-button fill="outline" class="share-button" (click)="clickShareApp()">
          Partager
        </ion-button>
      </div>
    </div>
    <br/><br/><br/><br/>
    <ion-button (click)="navigateTo('/home-v2')" class="ion-padding" expand="block" color="primary">
      Aller à la version 2
    </ion-button>
    <br/><br/><br/><br/>

    <!--<app-button-to-chat></app-button-to-chat>-->
</ion-content>
  `,
  styles: [`
    @import '../../../mixins';

ion-content {
  --padding-bottom: 63px; /* Height of your navbar */
}

#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

h2 {
  @include display-1;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}


@media screen and (min-width: 768px) {

  /* Apply the always-open-menu class to the ion-menu component */
  .always-open-menu {
    background: red !important;
    --ion-menu-width: auto;
    /* Set the menu width to "auto" to keep it open */
  }
}


#home-card-list {
  ion-card {
    border-radius: 2em;
  }

  p.placeholder {
    display: inline-block;
    height: 3pt;
  }

  ion-card-title {
    margin: 0;
    padding: 0;
    padding-bottom: 1pt;
    align-items: center;
    flex-direction: row;
    display: flex;
    font-size: 1.9em;

    span {}

    ion-button {
      margin-left: 2em;
    }
  }
}

// The new welcome header
.welcome-header {
  padding-top: calc(env(safe-area-inset-top) + 1.5rem);
  
  .greeting-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .greeting-title {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--ion-color-dark);
    }
    
    .streak-counter {
      display: flex;
      align-items: center;
      background: linear-gradient(45deg, var(--ion-color-warning), var(--ion-color-danger));
      padding: 0.5rem 1rem;
      border-radius: 20px;
      
      ion-icon {
        color: white;
        font-size: 1.2rem;
        margin-right: 0.3rem;
      }
      
      .streak-number {
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
        margin-right: 0.2rem;
      }
      
      .streak-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.8rem;
      }
    }
  }
}

// Fullscreen search overlay
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1998; // Increase from 998 to be above welcome header
  
  &.active {
    opacity: 1;
    visibility: visible;
  }
}

// Search section
.search-section {
  position: relative; // Add this for absolute positioning of results
  transition: all 0.3s ease;

  &.search-active {
    position: fixed;
    top: calc(env(safe-area-inset-top)); // Adjust to account for welcome header height = 80px (no need)
    left: 1rem;
    right: 1rem;
    z-index: 1999; // Increase from 999 to be above welcome header
    background: var(--ion-background-color, #fff);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 120px); // Adjust for header
    overflow: hidden;
  }

  .search-container {
    transition: all 0.3s ease;
    
    &.search-focused {
      padding: 0.6rem 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    .close-icon {
      color: var(--ion-color-medium);
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--ion-color-dark);
      }
    }
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--ion-color-light);
    border-radius: 16px;
    padding: 0.8rem 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .search-icon {
      color: var(--ion-color-medium);
      font-size: 1.2rem;
      margin-right: 0.8rem;
    }
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 1rem;
      color: var(--ion-color-dark);
      
      &::placeholder {
        color: var(--ion-color-medium);
      }
      
      &:focus {
        outline: none;
      }
    }
    
    .filter-icon {
      color: var(--ion-color-medium);
      font-size: 1.2rem;
      cursor: pointer;
    }
  }
}

// Enhanced search results container
.search-results-container {
  &.fullscreen {
    position: static;
    margin-top: 1rem;
    max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 200px);
    overflow-y: auto;
    border-radius: 12px;
    
    .results-list {
      max-height: none;
    }
  }
}

// Mobile-specific adjustments
@media screen and (max-width: 480px) {
  .search-section.search-active {
    left: 0.5rem;
    right: 0.5rem;
    // top: calc(env(safe-area-inset-top) + 0.5rem);
    top: calc(env(safe-area-inset-top) + 70px); // Slightly less space on mobile
  }
  
  .search-results-container.fullscreen {
    max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 170px); // Account for header
  }
}

// Keyboard adjustment for iOS
@supports (-webkit-touch-callout: none) {
  .search-section.search-active {
    max-height: calc(100vh - env(keyboard-inset-height, 0px) - env(safe-area-inset-top) - 2rem);
  }
}

// Search Results Container
.search-results-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 0.5rem;
  background: var(--ion-color-light);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow: hidden;
  
  .search-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 0.8rem;
    color: var(--ion-color-medium);
    
    ion-spinner {
      width: 20px;
      height: 20px;
    }
    
    span {
      font-size: 0.9rem;
    }
  }
  
  .search-results {
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: var(--ion-color-medium);
      text-align: center;
      
      ion-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        opacity: 0.6;
      }
      
      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
    
    .results-list {
      max-height: 350px;
      overflow-y: auto;
      
      .result-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--ion-color-light);
        cursor: pointer;
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: var(--ion-color-light);
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .result-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--ion-color-light);
          margin-right: 1rem;
          flex-shrink: 0;
          
          ion-icon {
            font-size: 1.2rem;
            color: var(--ion-color-primary);
          }
        }
        
        .result-content {
          flex: 1;
          min-width: 0; // Allows text truncation
          
          .result-title {
            margin: 0 0 0.2rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--ion-color-dark);
            
            // Truncate long titles
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .result-description {
            margin: 0 0 0.3rem 0;
            font-size: 0.85rem;
            color: var(--ion-color-medium);
            line-height: 1.3;
            
            // Limit to 2 lines
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .result-type {
            display: inline-block;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            background: var(--ion-color-light);
            color: var(--ion-color-dark);
            border-radius: 12px;
            font-weight: 500;
          }
        }
        
        .result-thumbnail {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          margin-left: 1rem;
          flex-shrink: 0;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media screen and (max-width: 480px) {
  .search-results-container {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
    
    .results-list .result-item {
      padding: 0.8rem;
      
      .result-icon {
        width: 35px;
        height: 35px;
        margin-right: 0.8rem;
      }
      
      .result-thumbnail {
        width: 40px;
        height: 40px;
        margin-left: 0.8rem;
      }
    }
  }
}

// Animation for search results appearance
.search-results-container {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


// 2. The swipper (v2)
.swiper {
  width: 100%;
  height: 320px;
  overflow: visible;
  padding: 0 0 2rem 0;
}

/*:host {
  --swiper-navigation-color: var(--ion-color-primary);
  --swiper-pagination-color: var(--ion-color-primary);
  --swiper-pagination-bullet-inactive-color: var(--ion-color-light);
  --swiper-pagination-bottom: 0px;
}*/

// Modern swiper design
.container {
  padding: 0 0rem;
  overflow: visible;
  & > *:first-child {
    margin-left: 1rem;
  }
}

swiper-slide {
  position: relative;
  height: 280px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  background: var(--ion-color-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-right: 16px;

  /*&:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  }*/

  .description {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 3rem 1.5rem 1.5rem;
    text-align: left;
    z-index: 2;
  }

  h3 {
    color: white;
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

    span {
      @include display-1;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0 0 1rem 0;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }

  ion-button {
    // The same as in the CTA
    --background: rgba(255, 255, 255, 0.2);
    --color: white;
    //--border-radius: 12px;
    --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    --padding-start: 1.2rem;
    --padding-end: 1.2rem;
    --padding-top: 0.6rem;
    --padding-bottom: 0.6rem;
    font-weight: 600;
    font-size: 0.85rem;
    backdrop-filter: blur(10px);
    
    &:hover {
      --background: rgba(255, 255, 255, 0.3);
    }
  }

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
}

// Responsive design
/*@media screen and (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
  
  .swiper {
    height: 360px;
  }
  
  swiper-slide {
    height: 320px;
    
    .description {
      padding: 4rem 2rem 2rem;
    }
    
    h3 {
      font-size: 1.6rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
}*/

@media screen and (min-width: 1024px) {
  swiper-slide {
    margin-right: 24px;
  }
}

// Training CTA styles
.training-cta-section {
  padding-top: 0;
  .training-cta-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px;
    padding: 2rem;
    margin: 0 0 1rem 0;
    position: relative;
    overflow: hidden;
    
    // Add subtle pattern overlay
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="2"/></g></svg>');
      pointer-events: none;
    }
    
    .training-cta-content {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
      
      .cta-icon-container {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 1rem;
        margin-right: 1rem;
        backdrop-filter: blur(10px);
        
        .training-icon {
          color: white;
          font-size: 2rem;
        }
      }
      
      .training-text {
        flex: 1;
        
        h3 {
          color: white;
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }
      }
    }
    
    .training-features {
      display: flex;
      justify-content: space-around;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
      
      .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        flex: 1;
        
        ion-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.5rem;
          backdrop-filter: blur(5px);
        }
        
        span {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.8rem;
          font-weight: 500;
        }
      }
    }
    
    .training-button {
      width: 100%;
      --background: rgba(255, 255, 255, 0.2);
      --color: white;
      --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      --padding-start: 1.5rem;
      --padding-end: 1.5rem;
      --padding-top: 0.8rem;
      --padding-bottom: 0.8rem;
      font-weight: 600;
      font-size: 1rem;
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 2;
      
      &:hover {
        --background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// Responsive adjustments
@media screen and (max-width: 480px) {
  .training-cta-section {
    .training-cta-container {
      padding: 1.5rem;
      
      .training-cta-content {
        .training-text h3 {
          font-size: 1.1rem;
        }
      }
      
      .training-features {
        .feature-item {
          ion-icon {
            font-size: 1.2rem;
          }
          
          span {
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}


// 3. The premium-subscription
.premium-subscription {
  padding-top: 3em;

  & p {
    color: var(--ion-color-medium);
  }
}


.video-card {
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 1em;

  .left {
    //min-width: 100px;
    //max-width: 200px;
    overflow: hidden;
    //position: relative;

    display: flex;
    height: 120px;
    width: 200px;
    min-width: 200px;
    align-items: center;
    flex-direction: row;

    img {
      scale: 1.0;
    }

    ion-icon {
      display: none;
      // color: var(--ion-color-dark);
      color: var(--ion-color-medium);
      font-size: 5em;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .right {
    h3 {
      @include display-1;
      cursor: pointer;
    }

    .stars {
      color: var(--ion-color-warning);
    }

    p {
      color: var(--ion-color-medium);
      font-size: .8em;
    }
  }

  p,
  h3 {
    margin: 0;
  }
}

.video-card:hover .left ion-icon {
  color: var(--ion-color-secondary);
}

/*.misc-list {
  .misc-item {
    margin-top: 1em;
    margin-bottom: 1em;
    position: relative;
    overflow: hidden;

    & img {
      position: absolute;
      z-index: -999;
      filter: brightness(0.8);
      // Make it gradient from opaque (top) to opaque (80% height) to transparent (bottom)
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0));
      scale: 1.5;
    }

    &>div {
      padding-top: 3em;
      padding-bottom: 3em;
    }

    & p,
    & h3 {
      z-index: 999;
      color: white;
      text-shadow: 0 0 10px black;
    }

    ion-button {
      margin-top: 1em;
    }
  }
}*/

.appointment-card {
  display: flex;
  flex-direction: row;
  align-items: center;

  &>ion-icon {
    padding-right: 1em;
    font-size: 1.5em;
  }

  &>div {
    flex: 1;
  }
}

// Apps header with "Voir plus"
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    flex: 1;
  }

  .voir-plus {
    color: var(--ion-color-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }
  }
}

// The section title
.section-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ion-color-dark);
}

// Chat CTA styles
.chat-cta-section {
  .chat-cta-container {
    background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
    border-radius: 20px;
    padding: 1.5rem;
    margin: 1rem 0;
    
    .chat-cta-content {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      
      .chat-icon {
        color: white;
        font-size: 2rem;
        margin-right: 1rem;
      }
      
      .chat-text {
        h3 {
          color: white;
          margin: 0 0 0.2rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 0.9rem;
        }
      }
    }
    
    .chat-button {
      // The same as in the swiper
      --background: rgba(255, 255, 255, 0.2);
      --color: white;
      width: 100%;
      //--border-radius: 8px;
      --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      --padding-start: 1.2rem;
      --padding-end: 1.2rem;
      --padding-top: 0.6rem;
      --padding-bottom: 0.6rem;
      font-weight: 600;
      font-size: 0.85rem;
      backdrop-filter: blur(10px);
      
      &:hover {
        --background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// Training section styles
.training-section {
  .chip-selector {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    
    .training-chip {
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      font-size: 0.85rem;
      
      &.active {
        --background: var(--ion-color-primary);
        --color: white;
      }
    }
  }
  
  .training-videos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    
    .training-video-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      .video-thumbnail {
        position: relative;
        height: 160px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          ion-icon {
            color: white;
            font-size: 1.5rem;
          }
        }
        
        .duration-badge {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
        }
      }
      
      .video-info {
        padding: 1rem;
        
        .video-title {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ion-color-dark);
        }
        
        .video-stats {
          display: flex;
          gap: 1rem;
          
          span {
            font-size: 0.8rem;
            color: var(--ion-color-medium);
          }
        }
      }
    }
  }
}

// Premium subscription redesign
.premium-subscription-redesigned {
  
  .subscription-card {
    //background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background: rgba(0, 0, 0, 0.8);
    padding: 2rem;
    border-radius: 24px;
    color: white;
    text-align: center;
    margin: 0rem 1rem;
    
    .subscription-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1rem;
      
      .premium-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        color: #ffd700;
      }
      
      h2 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
      }
    }
    
    .subscription-description {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      opacity: 0.9;
    }
    
    .premium-features {
      margin-bottom: 2rem;
      
      .feature-item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.8rem;
        
        ion-icon {
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }
        
        span {
          font-size: 0.9rem;
        }
      }
    }
    
    .premium-button {
      width: 100%;
      // Same as in the swiper and chat CTA
      --background: rgba(255, 255, 255, 0.2);
      --color: white;
      //--border-radius: 12px;
      --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      --padding-start: 1.2rem;
      --padding-end: 1.2rem;
      --padding-top: 0.6rem;
      --padding-bottom: 0.6rem;
      font-weight: 600;
      font-size: 0.85rem;
      backdrop-filter: blur(10px);
      
      &:hover {
        --background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// Share section styles
.share-section {
  .share-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--ion-color-light);
    border-radius: 16px;
    padding: 1rem;
    
    .share-content {
      display: flex;
      align-items: center;
      
      .share-icon {
        color: var(--ion-color-primary);
        font-size: 1.8rem;
        margin-right: 1rem;
      }
      
      .share-text {
        h3 {
          margin: 0 0 0.2rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ion-color-dark);
        }
        
        p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--ion-color-medium);
        }
      }
    }
    
    .share-button {

      --border-color: var(--ion-color-primary);
      --color: var(--ion-color-primary);
      --border-radius: 12px;
    }
  }
}

// Tips section styling (consistent with existing swiper design)
.tips-section {
  .container {
    padding: 0 0rem;
    overflow: visible;
    & > *:first-child {
      margin-left: 1rem;
    }
  }

  swiper-slide {
    position: relative;
    height: 320px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    background: var(--ion-color-light);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-right: 16px;


    .tip-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      padding: 3rem 1.5rem 1.5rem;
      text-align: left;
      z-index: 2;
      max-height: 90%;
      overflow-y: auto;
    }

    h3 {
      color: white;
      margin: 0 0 0.8rem 0;
      font-size: 1.4rem;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .tip-excerpt {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0 0 1rem 0;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    }

    .tip-details {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, margin 0.3s ease;
      
      &.expanded {
        max-height: 200px;
        margin-bottom: 1rem;
      }

      p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.85rem;
        line-height: 1.4;
        margin: 0;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }
    }

    .tip-button {
      --background: rgba(255, 255, 255, 0.2);
      --color: white;
      --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      --padding-start: 1.2rem;
      --padding-end: 1.2rem;
      --padding-top: 0.6rem;
      --padding-bottom: 0.6rem;
      font-weight: 600;
      font-size: 0.85rem;
      backdrop-filter: blur(10px);
      
      &:hover {
        --background: rgba(255, 255, 255, 0.3);
      }
    }

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
  }
}

// Responsive adjustments
@media screen and (min-width: 768px) {
  .tips-section {
    swiper-slide {
      height: 360px;
      
      .tip-content {
        padding: 4rem 2rem 2rem;
        max-height: 75%;
      }
      
      h3 {
        font-size: 1.6rem;
      }
      
      .tip-excerpt {
        font-size: 1rem;
      }
    }
  }
}

`]
})
export class HomePage extends FormComponent implements OnInit, AfterViewInit {
  user: any = null
  content: any = null

  videos: any = []

  // Used for debugging only
  token: string = undefined

  override form = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email])
  })

  // The swiper at the top of the page
  @ViewChild('swiperEl') swiperEl: ElementRef | null = null as any

  // Required by the Search component
  searchControl = new FormControl('');
  searchResults: any = null;
  isSearching = false;
  showSearchResults = false;
  private searchSubscription: any;
  
  // Used to handle the dynamic search
  isSearchActive = false;
  private searchFocusTimeout: any;

  // Used to manage the newly designed tips section
  expandedTips: { [key: string]: boolean } = {};

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    public router: Router,
    private feedbackService: FeedbackService,
    private http: HttpClient,
    private platform: Platform
  ) {
    super()
    this.route.params.subscribe(async (params) => {
      //await this.loadData()
    })
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd && this.router.url == '/home') {
        this.contentService.getCollection('/videos', 0, { f_category: 'home' }).subscribe((res: any) => {
          this.videos = res.data as object
        })
      }
    })
    // register()
  }

  async ngOnInit() {
    let hiddeableIds = ['calory', 'reequilibrage']
    let hiddeableElts = hiddeableIds.map((id) => document.getElementById(id))
    hiddeableElts.forEach((elt) => {
      if (elt) {
        elt.style.display = 'none'
      }
    })

    // The user data
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      this.user = user
    })

    // Debugging (to be removed later)
    this.contentService.storage.get('token').then((token) => {
      this.token = token
    })

    // Setup the search feature
    this.setupSearch();
  }

  async ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
  }

  async ngAfterViewInit() {
    register()
    const swiperParams: SwiperOptions = {
      modules: [Navigation, Pagination],
      injectStylesUrls: [
        './node_modules/swiper/modules/navigation-element.min.css',
        './node_modules/swiper/modules/pagination-element.min.css'
      ]
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
    //this.swiperEl.nativeElement.initialize()
    console.log(this.swiperEl.nativeElement)
  }

  onSwiper(event: any) {

  }

  onSlideChange() {
  }

  navigateTo(url: string) {
    this.router.navigate([url])
  }

  registerToWaitingList() {
    this.contentService.post('/waiting-list', this.form.value)
      .subscribe((data) => {
        this.feedbackService.registerNow('Votre email à bien été enregistré.', 'success')
      })
  }

  goToVideo(video_id: number) {
    this.router.navigate(['/video-view/', video_id])
  }

  getUrl(suffix: string) {
    return environment.rootEndpoint + '/' + suffix
  }

  toggleContent(element: HTMLElement, event: any): void {
    if (element.style.display === 'none') {
      element.style.display = 'block';
      event.target.innerText = 'Cacher';
    } else {
      element.style.display = 'none';
      event.target.innerText = 'Voir plus';
    }
  }

  getRemainingTrialDays(trialExpiresAt: string): number {
    const trialEndDate = new Date(trialExpiresAt);
    const currentDate = new Date();
    const timeDifference = trialEndDate.getTime() - currentDate.getTime();
    const days = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(days);
  }

  /**
   * Used for debugging
   */
  async unvalidateToken() {
    let token = await this.contentService.storage.get('token')
    let bearerHeaders = await this.contentService.bearerHeaders()
    console.log(`Token now: ${token}`, bearerHeaders)
    await this.contentService.storage.set('token', 'invalid_token');

    token = await this.contentService.storage.get('token')
    console.log(`Token is now: ${token}`, bearerHeaders)
  }

  async refreshToken() {
    let token = await this.contentService.storage.get('token')
    console.log(`Token is: ${token}`)

    this.contentService.refreshToken().subscribe((res: any) => {
      // Sleep 1s
      setTimeout(async () => {
        let newToken = await this.contentService.storage.get('token')
        console.log(`Token has changed: ${token} -> ${newToken}`)
        this.token = newToken
        this.cdRef.detectChanges()
      }, 1000)
    })
  }
  
  private setupSearch() {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300), // Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit if the value has changed
      switchMap((query: string) => {
        if (!query || query.trim().length < 2) {
          this.showSearchResults = false;
          this.searchResults = null;
          this.isSearching = false;
          return EMPTY;
        }

        this.isSearching = true;
        this.showSearchResults = true;

        return this.http.get<any[]>(`${environment.apiEndpoint}/search?query=${encodeURIComponent(query)}`)
          .pipe(
            catchError((error) => {
              console.error('Search error:', error);
              this.isSearching = false;
              this.showSearchResults = false;
              return EMPTY; // Return an empty observable on error
            })
          );
      })
    )
      .subscribe((response:any) => {
        this.isSearching = false;
        if (response && response.status === 'success') {
          this.searchResults = response.data;
        } else {
          this.searchResults = { videos: [], recipes: [], applinks: [] };
        }
        this.cdRef.detectChanges();
      })
  }

  onSearchInput(event: any) {
    // What is this ??? (TODO later)
    const value = event.target.value;
    this.searchControl.setValue(value, { emitEvent: true });
  }

  onSearchBlur(): void {
    // What is this for ???
    /*setTimeout(() => {
      this.showSearchResults = false;
      this.cdRef.detectChanges();
    }, 200);*/

    // Clear any existing timeout
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
    
    // Delay hiding to allow for result clicks
    this.searchFocusTimeout = setTimeout(() => {
      this.isSearchActive = false;
      this.showSearchResults = false;
      this.cdRef.detectChanges();
    }, 200);
  }

  onSearchResultClick(result: any): void {
    this.isSearchActive = false;
    this.showSearchResults = false;
    this.searchControl.setValue('');
    
    // Navigate based on the result route
    if (result.route) {
      this.router.navigate([result.route]);
    }
  }

  getResultIcon(entity: string): string {
    switch (entity) {
      case 'video':
        return 'play-circle';
      case 'recipe':
        return 'restaurant';
      case 'applink':
        return 'apps';
      default:
        return 'document';
    }
  }

  // Getter for template
  get searchQuery(): string {
    return this.searchControl.value || '';
  }

  async clickShareApp() {
    if (this.platform.is("ios")) {
      let link = 'https://apps.apple.com/app/id1234567890'; // Replace with your iOS app link
      let res = await Store.displayShareSheet({message: link});
      console.log(res);
    } else if (this.platform.is("android")) {
      let link = 'https://play.google.com/store/apps/details?id=com.example.app'; // Replace with your Android app link
      let res = await Store.displayShareSheet({message: link});
      console.log(res);
    }
  }

  // Used to handle the dynamic search
  onSearchFocus(): void {
    this.isSearchActive = true;
    this.showSearchResults = true;
    this.cdRef.detectChanges();
  }

  // Used to toggle the expanded state of a tip
  toggleTip(tipKey: string): void {
    this.expandedTips[tipKey] = !this.expandedTips[tipKey];
    this.cdRef.detectChanges();
  }
}
