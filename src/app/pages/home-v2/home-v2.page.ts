import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, switchMap } from 'rxjs';
import { BottomNavbarUtilsService } from 'src/app/bottom-navbar-utils.service';
import { ContentService } from 'src/app/content.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home-v2',
  template: `
<ion-content>
  <!-- Header Section -->
  <div class="app-header" [class.transparent]="isSearchActive">
    <div class="header-content">
      <ion-menu-button *ngIf="user?.function === 'admin' || user?.function === 'coach'"></ion-menu-button>
      <h1 class="greeting-title">
        {{ user ? 'Bonjour, ' + user.firstname : 'Bienvenue sur Training Day' }}
      </h1>
    </div>
  </div>

  <!-- Trial Notification -->
  <div class="notifications-section" *ngIf="user" [class.transparent]="isSearchActive">
    <ion-card 
      color="warning" 
      class="trial-notification" 
      *ngIf="user.trial_is_active && !(user.subscription_is_active || (user.grouped_perishables && user.grouped_perishables['sport-coach']) || (user.grouped_perishables && user.grouped_perishables['food-coach']))">
      <ion-card-content>
        <div class="trial-content">
          <ion-icon name="time" class="trial-icon"></ion-icon>
          <div class="trial-text">
            <p>
              Vous disposez d'un essai gratuit de <strong>{{ getRemainingTrialDays(user.trial_expires_at) }} jours</strong>. 
              Profitez-en pour discuter avec votre coach.
            </p>
            <p class="trial-expiry">
              L'essai se terminera le <strong>{{ user.trial_expires_at | date:'dd MMMM yyyy' }}</strong>.
            </p>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
    <!-- Unread Messages Notification -->
    <ion-card 
      color="primary" 
      class="messages-notification" 
      *ngIf="unreadMessagesCount > 0"
      (click)="navigateTo('/messenger-master')">
      <ion-card-content>
        <div class="messages-content">
          <ion-icon name="chatbubbles" class="messages-icon"></ion-icon>
          <div class="messages-text">
            <p>
              Vous avez <strong>{{ unreadMessagesCount }} {{ unreadMessagesCount === 1 ? 'nouveau message' : 'nouveaux messages' }}</strong> 
              de votre coach.
            </p>
            <p class="messages-action">
              Touchez pour voir vos messages
            </p>
          </div>
          <ion-icon name="chevron-forward" class="messages-arrow"></ion-icon>
        </div>
      </ion-card-content>
    </ion-card>
  </div>

  <!-- Appointments Notification -->
  <div class="appointments-section" *ngIf="user?.appointments?.length > 0" [class.transparent]="isSearchActive">
    <div class="section-header ion-padding">
      <h2 class="section-title">Mes rendez-vous</h2>
    </div>
    
    <div class="appointments-container ion-padding-horizontal">
      <ion-card 
        class="appointment-card" 
        *ngFor="let appointment of user.appointments">
        <ion-card-content>
          <div class="appointment-content">
            <div class="appointment-icon">
              <ion-icon name="calendar"></ion-icon>
            </div>
            <div class="appointment-details">
              <p class="appointment-date">
                Rendez-vous le <strong>{{ appointment.datetime | date:'dd MMMM yyyy' }}</strong>
                à <strong>{{ appointment.datetime | date:'HH:mm' }}</strong>
              </p>
              <p class="appointment-reason">
                <strong>Motif :</strong> {{ appointment.reason }}
              </p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </div>
  </div>

  <!-- Search Overlay -->
  <div class="search-overlay" 
       [class.active]="isSearchActive" 
       (click)="closeSearch()">
  </div>

  <!-- Search Section -->
  <div class="search-section-wrapper">
    <div class="search-section" 
        [class.search-active]="isSearchActive">
      <div class="search-container">
        <ion-icon name="search" class="search-icon"></ion-icon>
        <input 
          type="text" 
          placeholder="Rechercher un exercice, un programme..." 
          class="search-input"
          [formControl]="searchControl"
          (focus)="openSearch()"
          (blur)="handleSearchBlur()">
        <ion-icon name="options" 
                  class="filter-icon" 
                  *ngIf="!isSearchActive"></ion-icon>
        <ion-icon name="close" 
                  class="close-icon" 
                  *ngIf="isSearchActive" 
                  (click)="closeSearch()"></ion-icon>
      </div>

      <!-- Search Results -->
      <div class="search-results-container" *ngIf="showSearchResults">
        <!-- Loading State -->
        <div class="search-loading" *ngIf="isSearching">
          <ion-spinner></ion-spinner>
          <span>Recherche en cours...</span>
        </div>

        <!-- Results -->
        <div class="search-results" *ngIf="!isSearching && searchResults">
          <!-- No Results -->
          <div class="no-results" *ngIf="!hasResults()">
            <ion-icon name="search"></ion-icon>
            <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
          </div>

          <!-- Results List -->
          <div class="results-list" *ngIf="hasResults()">
            <div class="result-item" 
                *ngFor="let result of getAllResults()" 
                (click)="selectResult(result)">
              <div class="result-icon">
                <ion-icon [name]="getResultIcon(result.entity)"></ion-icon>
              </div>
              <div class="result-content">
                <h4 class="result-title">{{ result.title }}</h4>
                <!--<p class="result-description">{{ result.description }}</p>-->
                <span class="result-type">{{ getResultType(result.entity) }}</span>
              </div>
              <div class="result-thumbnail" *ngIf="result.thumbnailUrl">
                <img [src]="result.thumbnailUrl" [alt]="result.title">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Applications Section -->
  <div class="apps-section">
    <div class="section-header ion-padding">
      <h2 class="section-title">Mes Applications</h2>
      <span class="voir-plus" (click)="navigateTo('/tools')">Voir plus</span>
    </div>

    <!-- Swiper container with fixed margins -->
    <div class="swiper-container">
      <swiper-container 
        navigation="false" 
        pagination="true" 
        css-mode="false" 
        loop="false" 
        slides-per-view="1.2" 
        space-between="16" 
        centered-slides="false"
        init="true">
        
        <swiper-slide>
          <div class="slide-content">
            <div class="image-container">
              <img title="Chronomètre" src="../../../assets/medias/IMG_0962_1024x683.jpeg" />
            </div>
            <div class="slide-description">
              <p>Entraînez-vous avec l'application chronomètre réglable pour chaque tour d'entraînement.</p>
              <h3>Chronomètre</h3>
              <ion-button class="slide-button" (click)="navigateTo('/app-timer')">
                Découvrir
              </ion-button>
            </div>
          </div>
        </swiper-slide>
        
        <swiper-slide>
          <div class="slide-content">
            <div class="image-container">
              <img title="GPS Course" src="../../../assets/medias/IMG_0961_1024x683.jpeg" />
            </div>
            <div class="slide-description">
              <p>Calculez vos kilomètres parcourus avec l'application GPS.</p>
              <h3>Course</h3>
              <ion-button class="slide-button" (click)="navigateTo('/app-gps')">
                Découvrir
              </ion-button>
            </div>
          </div>
        </swiper-slide>
        
        <swiper-slide>
          <div class="slide-content">
            <div class="image-container">
              <img title="Calculateur IMC" src="./../../assets/medias/imc-stockphoto.png" />
            </div>
            <div class="slide-description">
              <p>Découvrez notre application calculateur d'IMC pour connaître votre indice de masse corporelle.</p>
              <h3>Calculateur d'IMC</h3>
              <ion-button class="slide-button" (click)="navigateTo('/app-imc')">
                Découvrir
              </ion-button>
            </div>
          </div>
        </swiper-slide>
        
        <swiper-slide>
          <div class="slide-content">
            <div class="image-container">
              <img title="Calculateur de calories" src="../../../assets/medias/calory-stockphoto.png" />
            </div>
            <div class="slide-description">
              <p>Découvrez notre application calculateur de calories.</p>
              <h3>Calculateur de calories</h3>
              <ion-button class="slide-button" (click)="navigateTo('/app-calories')">
                Découvrir
              </ion-button>
            </div>
          </div>
        </swiper-slide>
        
        <swiper-slide>
          <div class="slide-content">
            <div class="image-container">
              <img title="Suivi du poids" src="../../../assets/medias/weight-tracking-stockphoto.png" />
            </div>
            <div class="slide-description">
              <p>Découvrez notre application suivi du poids.</p>
              <h3>Suivi du poids</h3>
              <ion-button class="slide-button" (click)="navigateTo('/app-weight-tracking')">
                Découvrir
              </ion-button>
            </div>
          </div>
        </swiper-slide>
        
      </swiper-container>
    </div>
  </div>

  <!-- Chat CTA Section -->
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

  <!-- Training Section -->
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
  </div>

  <!-- Premium Subscription Section -->
  <div class="premium-subscription-section">
    <div class="section-header ion-padding">
      <h2 class="section-title">Profiter des avantages</h2>
    </div>
    <div class="subscription-card ion-padding">
      <div class="subscription-header">
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

  <!-- Featured Videos Section -->
  <div class="featured-videos-section">
    <div class="section-header ion-padding">
      <h2 class="section-title">Découvrez les nouvelles actualités sportives</h2>
    </div>
    
    <div class="videos-container ion-padding">
      <div class="video-card" *ngFor="let video of videos" (click)="goToVideo(video.id)">
        <div class="video-thumbnail">
          <img 
            [src]="video.thumbnail ? getUrl(video.thumbnail.permalink) : '/assets/logo-light-1024x1024-noalpha.jpg'" 
            [alt]="video.title" 
            class="thumbnail-image" />
          <div class="play-overlay">
            <ion-icon name="play-circle-outline"></ion-icon>
          </div>
        </div>
        <div class="video-content">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tips and Advice Section -->
  <div class="tips-section">
    <div class="section-header ion-padding">
      <h2 class="section-title">Astuces et conseils</h2>
      <span class="voir-plus" (click)="navigateTo('/tips')">Voir plus</span>
    </div>

    <!-- Tips Swiper Container -->
    <div class="tips-swiper-container">
      <swiper-container 
        navigation="false" 
        pagination="true" 
        css-mode="false" 
        loop="false" 
        slides-per-view="1.1" 
        space-between="16" 
        centered-slides="false" 
        autoplay="true" 
        autoplay-delay="4000"
        init="true">
        
        <swiper-slide>
          <div class="tip-slide">
            <div class="tip-image-container">
              <img src="../../../assets/medias/plat-bol-bouddha-legumes-legumineuses-vue-dessus-1024x683.jpeg" 
                  alt="Les calories" />
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
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="tip-slide">
            <div class="tip-image-container">
              <img src="../../../assets/medias/femme-active-mesurant-sa-taille-1024x767.jpeg" 
                  alt="Rééquilibrage alimentaire" />
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
          </div>
        </swiper-slide>
      </swiper-container>
    </div>
  </div>

  <!-- Share Section -->
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

  <!-- Bottom Spacing -->
  <div class="bottom-spacing"></div>
</ion-content>
  `,
  styles: [`
@import '../../../mixins';

ion-content {
  --padding-bottom: 63px;
}

// Common mixins for better maintainability
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

@mixin card-container {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  background: var(--ion-color-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

@mixin section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .section-title {
    @include display-1;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ion-color-dark);
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

@mixin gradient-overlay {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

// Header styles
.app-header {
  padding: calc(env(safe-area-inset-top) + 1rem) 1rem 1rem;
  background: var(--ion-background-color, #fff);
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.transparent {
    opacity: 0;
  }
  
  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .greeting-title {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--ion-color-dark);
      flex: 1;
    }
  }
}

// Notifications section
.notifications-section {
  padding: 0 1rem;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
  
  .trial-notification {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
    margin-bottom: 1rem;
    
    ion-card-content {
      padding: 1rem;
      
      .trial-content {
        display: flex;
        align-items: flex-start;
        
        .trial-icon {
          color: var(--ion-color-warning-contrast);
          font-size: 1.5rem;
          margin-right: 1rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }
        
        .trial-text {
          flex: 1;
          
          p {
            margin: 0 0 0.5rem 0;
            color: var(--ion-color-warning-contrast);
            font-size: 0.9rem;
            line-height: 1.4;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            &.trial-expiry {
              font-size: 0.9rem;
              opacity: 0.9;
            }
            
            strong {
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  // Messages notification
  .messages-notification {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
    margin-bottom: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    ion-card-content {
      padding: 1rem;
      
      .messages-content {
        display: flex;
        align-items: center;

        .messages-icon {
          color: var(--ion-color-primary-contrast);
          font-size: 1.5rem;
          margin-right: 1rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }
        
        .messages-text {
          flex: 1;
          
          p {
            margin: 0 0 0.5rem 0;
            color: var(--ion-color-primary-contrast);
            font-size: 0.9rem;
            line-height: 1.4;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            &.messages-action {
              font-size: 0.9rem;
              opacity: 0.9;
            }
            
            strong {
              font-weight: 600;
            }
          }
        }
        
        .messages-arrow {
          color: var(--ion-color-primary-contrast);
          font-size: 1.2rem;
          opacity: 0.7;
          margin-left: 0.5rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }
      }
    }
  }
}

// Appointments section
.appointments-section {
  margin-bottom: 1.5rem;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
  
  .section-header {
    @include section-header;
    margin-bottom: 0.5rem;
  }
  
  .appointments-container {
    .appointment-card {
      border-radius: 16px;
      margin-bottom: 0.75rem;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15);
      border-left: 4px solid var(--ion-color-warning);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      ion-card-content {
        padding: 1rem;
        
        .appointment-content {
          display: flex;
          align-items: flex-start;
          
          .appointment-icon {
            background: var(--ion-color-warning-tint);
            border-radius: 12px;
            padding: 0.75rem;
            margin-right: 1rem;
            flex-shrink: 0;
            
            ion-icon {
              color: var(--ion-color-warning-shade);
              font-size: 1.3rem;
            }
          }
          
          .appointment-details {
            flex: 1;
            
            .appointment-date {
              margin: 0 0 0.5rem 0;
              color: var(--ion-color-dark);
              font-size: 0.9rem;
              line-height: 1.4;
              
              strong {
                font-weight: 600;
                color: var(--ion-color-warning-shade);
              }
            }
            
            .appointment-reason {
              margin: 0;
              color: var(--ion-color-medium);
              font-size: 0.9rem;
              line-height: 1.3;
              
              strong {
                font-weight: 600;
                color: var(--ion-color-dark);
              }
            }
          }
        }
      }
    }
  }
}

// Mobile responsiveness for notifications
@media screen and (max-width: 480px) {
  .notifications-section {
    padding: 0 0.5rem;
    
    .trial-notification {
      ion-card-content {
        padding: 0.75rem;
        
        .trial-content {
          .trial-icon {
            font-size: 1.3rem;
            margin-right: 0.75rem;
          }
          
          .trial-text {
            p {
              font-size: 0.9rem;
              
              &.trial-expiry {
                font-size: 0.8rem;
              }
            }
          }
        }
      }
    }
  }
  
  .appointments-section {
    .appointments-container {
      padding: 0 0.5rem;
      
      .appointment-card {
        ion-card-content {
          padding: 0.75rem;
          
          .appointment-content {
            .appointment-icon {
              padding: 0.5rem;
              margin-right: 0.75rem;
              
              ion-icon {
                font-size: 1.1rem;
              }
            }
            
            .appointment-details {
              .appointment-date {
                font-size: 0.9rem;
              }
              
              .appointment-reason {
                font-size: 0.8rem;
              }
            }
          }
        }
      }
    }
  }
}

// Animation for notifications
.notifications-section,
.appointments-section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Search overlay
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background: rgba(0, 0, 0, 0.3); // The mobile keyboard causes an ugly overlay
  z-index: 1998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.active {
    opacity: 1;
    visibility: visible;
  }
}

// Search section wrapper (to manage the placeholder when the search-section is active)
.search-section-wrapper {
  height: 65px;
  width: 100%;
  //background: blue;
  display: inline-block;
  margin-bottom: 10px;
}

// Search section
.search-section {
  // position: relative;
  position: absolute;
  padding: 0rem 1rem 1rem 1rem;
  transition: all 0.3s ease;
  width: 100%;
  //background: red;

  &.search-active {
    top: calc(env(safe-area-inset-top) + 1rem);
    left: 1rem;
    right: 1rem;
    z-index: 1999;
    background: var(--ion-background-color, #fff);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    max-height: calc(100vh - env(safe-area-inset-top) - 2rem);
    overflow: hidden;
  }

  .search-container {
    display: flex;
    align-items: center;
    background: var(--ion-color-light);
    border-radius: 16px;
    padding: 0.8rem 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    .search-icon, .filter-icon, .close-icon {
      color: var(--ion-color-medium);
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--ion-color-dark);
      }
    }
    
    .search-icon {
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
  }
}

// Search results
// Search results - Optimized for mobile Google-like experience
.search-results-container {
  margin-top: 0.5rem; // Reduced margin
  max-height: calc(100vh - env(safe-area-inset-top) - 160px); // Optimized height
  overflow-y: auto;
  border-radius: 12px;
  background: var(--ion-color-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); // Lighter shadow
  
  .search-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem; // Reduced padding
    gap: 0.6rem;
    color: var(--ion-color-medium);
    
    ion-spinner {
      width: 18px; // Smaller spinner
      height: 18px;
    }
    
    span {
      font-size: 0.9rem; // Smaller text
    }
  }
  
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem; // Reduced padding
    color: var(--ion-color-medium);
    text-align: center;
    
    ion-icon {
      font-size: 1.5rem; // Smaller icon
      margin-bottom: 0.4rem;
      opacity: 0.6;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem; // Smaller text
    }
  }
  
  .results-list {
    .result-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem; // Reduced padding for compact look
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      cursor: pointer;
      transition: background-color 0.15s ease; // Faster transition
      min-height: 60px; // Set consistent compact height
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .result-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px; // Smaller icon container
        height: 32px;
        border-radius: 8px; // Smaller radius
        background: var(--ion-color-primary-tint);
        margin-right: 0.75rem; // Reduced margin
        flex-shrink: 0;
        
        ion-icon {
          font-size: 1rem; // Smaller icon
          color: white;
        }
      }
      
      .result-content {
        flex: 1;
        min-width: 0;
        
        .result-title {
          margin: 0 0 0.1rem 0; // Reduced bottom margin
          font-size: 0.9rem; // Smaller title
          font-weight: 500; // Lighter weight
          color: var(--ion-color-dark);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.2; // Tighter line height
        }
        
        .result-description {
          margin: 0 0 0.2rem 0; // Reduced margins
          font-size: 0.75rem; // Smaller description
          color: var(--ion-color-medium);
          line-height: 1.2; // Tighter line height
          display: -webkit-box;
          -webkit-line-clamp: 1; // Show only 1 line for compact look
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .result-type {
          display: inline-block;
          font-size: 0.65rem; // Smaller type badge
          padding: 0.15rem 0.4rem; // Smaller padding
          // background: var(--ion-color-primary-tint);
          background: rgb(var(--ion-color-medium-rgb), 0.3);
          color: var(--ion-color-dark);
          border-radius: 8px; // Smaller radius
          font-weight: 500;
        }
      }
      
      .result-thumbnail {
        width: 40px; // Smaller thumbnail
        height: 40px;
        border-radius: 6px; // Smaller radius
        overflow: hidden;
        margin-left: 0.75rem; // Reduced margin
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

// Enhanced mobile responsiveness
@media screen and (max-width: 480px) {
  .search-section.search-active {
    left: 0.5rem;
    right: 0.5rem;
    top: calc(env(safe-area-inset-top) + 0.5rem); // Better mobile positioning
  }
  
  .search-results-container {
    max-height: calc(100vh - env(safe-area-inset-top) - 140px);
    
    .results-list .result-item {
      padding: 0.6rem 0.75rem; // More compact on mobile
      min-height: 56px; // Standard mobile touch target
      
      .result-icon {
        width: 28px;
        height: 28px;
        margin-right: 0.6rem;
        
        ion-icon {
          font-size: 0.9rem;
        }
      }
      
      .result-content {
        .result-title {
          font-size: 0.9rem;
        }
        
        .result-description {
          font-size: 0.7rem;
        }
      }
      
      .result-thumbnail {
        width: 36px;
        height: 36px;
        margin-left: 0.6rem;
      }
    }
  }
}

// Applications section using refactored styles
.apps-section {
  margin-bottom: 2rem;
  
  .section-header {
    @include section-header;
  }
}

// Fixed swiper container without external margins
.swiper-container {
  overflow: visible;
  //padding: 0; // Remove external padding
  
  swiper-container {
    --swiper-navigation-color: var(--ion-color-primary);
    --swiper-pagination-color: var(--ion-color-primary);
    --swiper-pagination-bullet-inactive-color: var(--ion-color-light);
    --swiper-pagination-bottom: 0px;
    
    // Add internal padding to create breathing room
    padding-left: 1rem;
    padding-right: 1rem;
    // margin-left: -1rem; // Compensate for internal padding
    // margin-right: -1rem;
  }
}

// Optimized slide content
swiper-slide {
  .slide-content {
    @include card-container;
    position: relative;
    height: 280px;
    
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
    
    .slide-description {
      @include gradient-overlay;
      padding: 3rem 1.5rem 1.5rem;
      text-align: left;
      
      p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 1rem 0;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      }
      
      h3 {
        color: white;
        margin: 0 0 0.5rem 0;
        font-size: 1.4rem;
        font-weight: 700;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }
      
      .slide-button {
        @include glassmorphism-button;
      }

      // Some white font-color is not visible on the white background
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(3px);
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
    }
  }
}

// Mobile responsiveness
@media screen and (max-width: 480px) {
  .swiper-container {
    swiper-container {
      padding-left: 1rem;
      padding-right: 1rem;
      // Remove the negative margin compensation
    }
  }
  
  swiper-slide .slide-content .slide-description {
    padding: 2.5rem 1rem 1rem;
  }
}

// Chat CTA section
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
      @include glassmorphism-button;
      width: 100%;
    }
  }
}

// Training section
.training-section {
  margin-bottom: 2rem;
  
  .section-header {
    @include section-header;
  }
  
  .training-cta-section {
    padding-top: 0;
    
    .training-cta-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 2rem;
      margin: 0 0 1rem 0;
      position: relative;
      overflow: hidden;
      
      // Subtle pattern overlay
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
        @include glassmorphism-button;
        width: 100%;
        position: relative;
        z-index: 2;
      }
    }
  }
}

// Mobile responsiveness for training section
@media screen and (max-width: 480px) {
  .training-section {
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
}

// Premium subscription section
.premium-subscription-section {
  margin-bottom: 2rem;
  
  .section-header {
    @include section-header;
  }
  
  .subscription-card {
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
        margin-bottom: 0.5rem;
      }
      
      h2 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
      }
    }
    
    .subscription-description {
      margin: 0 0 1.5rem 0;
      font-size: 0.9rem;
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
      @include glassmorphism-button;
      width: 100%;
    }
  }
}

// Featured videos section
.featured-videos-section {
  margin-bottom: 2rem;
  
  .section-header {
    @include section-header;
  }
  
  .videos-container {
    .video-card {
      display: flex;
      align-items: center;
      background: var(--ion-color-light);
      border-radius: 16px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .video-thumbnail {
        position: relative;
        width: 120px;
        height: 90px;
        min-width: 120px;
        border-radius: 12px;
        overflow: hidden;
        margin-right: 1rem;
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(255, 255, 255, 0.9);
          font-size: 2rem;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          transition: color 0.2s ease;
        }
      }
      
      .video-content {
        flex: 1;
        min-width: 0; // Allows text truncation
        
        .video-title {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ion-color-dark);
          line-height: 1.3;
          
          // Limit to 2 lines
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .video-description {
          margin: 0;
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          line-height: 1.4;
          
          // Limit to 3 lines
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
      
      &:hover .video-thumbnail .play-overlay {
        color: var(--ion-color-primary);
      }
    }
  }
}

// Mobile responsiveness for videos
@media screen and (max-width: 480px) {
  .featured-videos-section {
    .videos-container {
      .video-card {
        padding: 0.75rem;
        
        .video-thumbnail {
          width: 100px;
          height: 75px;
          min-width: 100px;
          margin-right: 0.75rem;
          
          .play-overlay {
            font-size: 1.5rem;
          }
        }
        
        .video-content {
          .video-title {
            font-size: 0.9rem;
          }
          
          .video-description {
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}

// Tips and advice section
.tips-section {
  margin-bottom: 2rem;
  
  .section-header {
    @include section-header;
  }
  
  .tips-swiper-container {
    overflow: visible;
    
    swiper-container {
      --swiper-navigation-color: var(--ion-color-primary);
      --swiper-pagination-color: var(--ion-color-primary);
      --swiper-pagination-bullet-inactive-color: var(--ion-color-light);
      --swiper-pagination-bottom: 0px;
      
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .tip-slide {
      @include card-container;
      position: relative;
      height: 320px;
      
      .tip-image-container {
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
      
      .tip-content {
        @include gradient-overlay;
        padding: 3rem 1.5rem 1.5rem;
        text-align: left;
        max-height: 90%;
        overflow-y: auto;
        
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
            font-size: 0.9rem;
            line-height: 1.4;
            margin: 0;
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
          }
        }
        
        .tip-button {
          @include glassmorphism-button;
        }
      }
    }
  }
}

// Mobile responsiveness for tips
@media screen and (max-width: 480px) {
  .tips-section {
    .tips-swiper-container {
      .tip-slide {
        height: 280px;
        
        .tip-content {
          padding: 2.5rem 1rem 1rem;
          
          h3 {
            font-size: 1.2rem;
          }
          
          .tip-excerpt {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}

// Share section
.share-section {
  margin-bottom: 2rem;
  
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
          font-size: 0.9rem;
          color: var(--ion-color-medium);
        }
      }
    }
    
    .share-button {
      --border-color: var(--ion-color-primary);
      --color: var(--ion-color-primary);
      --border-radius: 12px;
      font-weight: 500;
    }
  }
}

// Bottom spacing to account for navigation
.bottom-spacing {
  height: 2rem;
}

// Mobile responsiveness for share section
@media screen and (max-width: 480px) {
  .share-section {
    .share-container {
      padding: 0.75rem;
      
      .share-content {
        .share-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
        }
        
        .share-text {
          h3 {
            font-size: 0.9rem;
          }
          
          p {
            font-size: 0.8rem;
          }
        }
      }
      
      .share-button {
        font-size: 0.9rem;
        --padding-start: 1rem;
        --padding-end: 1rem;
      }
    }
  }
}
  `]
})
export class HomeV2Page implements OnInit {

  // User data (you'll need to integrate with your user service)
  user: any = null;

  // Search functionality
  searchControl = new FormControl('');
  searchResults: any = null;
  isSearching = false;
  showSearchResults = false;
  isSearchActive = false;
  
  private searchSubscription: any;
  private searchFocusTimeout: any;

  // The videos
  videos: any[] = [];

  // The tips
  expandedTips: { [key: string]: boolean } = {};

  // The unread messages count
  unreadMessagesCount: number = 0;

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private contentService: ContentService,
    private bnus: BottomNavbarUtilsService
  ) { }
  
  ngOnInit() {
    this.setupSearch();
    this.loadUserData();
    this.loadUnreadCount();
    this.loadFeaturedVideos();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
  }
  
  ionViewWillEnter() {
    this.loadUnreadCount();
  }


  // Load user data from the content service
  private loadUserData() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      this.user = user;
      this.cdRef.detectChanges();
    });
  }

  private loadUnreadCount() {
    this.contentService.getOne('/conversations/unread-count', {}).subscribe((res: any) => {
      console.log('Unread count response:', res);
      if (res && res.unread_count && typeof res.unread_count === 'number') {
        this.unreadMessagesCount = res.unread_count;
      } else {
        this.unreadMessagesCount = 0;
      }
      this.cdRef.detectChanges();
    }, (error) => {
      console.error('Error loading unread count:', error);
      this.unreadMessagesCount = 0;
    });
  }
  
  getRemainingTrialDays(trialExpiresAt: string): number {
    const trialEndDate = new Date(trialExpiresAt);
    const currentDate = new Date();
    const timeDifference = trialEndDate.getTime() - currentDate.getTime();
    const days = timeDifference / (1000 * 3600 * 24);
    return Math.ceil(days);
  }

  // Search functionality
  private setupSearch() {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query || query.trim().length < 2) {
          this.showSearchResults = false;
          this.searchResults = null;
          this.isSearching = false;
          return EMPTY;
        }

        this.isSearching = true;
        this.showSearchResults = true;

        // Use the actual API endpoint from environment
        return this.http.get<any>(`${environment.apiEndpoint}/search?query=${encodeURIComponent(query)}`)
          .pipe(
            catchError((error) => {
              console.error('Search error:', error);
              this.isSearching = false;
              this.showSearchResults = false;
              return EMPTY;
            })
          );
      })
    ).subscribe((response: any) => {
      this.isSearching = false;
      if (response && response.status === 'success') {
        this.searchResults = response.data;
      } else {
        this.searchResults = { videos: [], recipes: [], applinks: [] };
      }
      this.cdRef.detectChanges();
    });
  }

  // Load featured videos
  private loadFeaturedVideos() {
    this.contentService.getCollection('/videos', 0, { f_category: 'home' }).subscribe((res: any) => {
      this.videos = res.data as any[];
      this.cdRef.detectChanges();
    });
  }

  // Add these utility methods
  goToVideo(videoId: number) {
    this.router.navigate(['/video-view/', videoId]);
  }

  getUrl(suffix: string) {
    return environment.rootEndpoint + '/' + suffix;
  }

  toggleTip(tipKey: string): void {
    this.expandedTips[tipKey] = !this.expandedTips[tipKey];
    this.cdRef.detectChanges();
  }

  openSearch() {
    this.isSearchActive = true;
    this.showSearchResults = true;
    this.bnus.setVisibility(false);
    this.cdRef.detectChanges();
  }

  handleSearchBlur() {
    if (this.searchFocusTimeout) {
      clearTimeout(this.searchFocusTimeout);
    }
    this.bnus.setVisibility(true);
    
    this.searchFocusTimeout = setTimeout(() => {
      this.closeSearch();
    }, 200);
  }

  // Close search functionality
  closeSearch() {
    this.isSearchActive = false;
    this.showSearchResults = false;
    this.searchResults = null; // Clear results for better performance
    this.isSearching = false;
    this.cdRef.detectChanges();
  }

  // Select a search result
  selectResult(result: any) {
    // Clear search immediately for better UX
    this.isSearchActive = false;
    this.showSearchResults = false;
    this.searchControl.setValue('', { emitEvent: false }); // Don't trigger search
    
    // Add haptic feedback for mobile (optional enhancement)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (result.route) {
      this.router.navigate([result.route]);
    }
    
    this.cdRef.detectChanges();
  }

  // Helper methods
  get searchQuery(): string {
    return this.searchControl.value || '';
  }

  hasResults(): boolean {
    return this.searchResults && (
      this.searchResults.videos?.length > 0 ||
      this.searchResults.recipes?.length > 0 ||
      this.searchResults.applinks?.length > 0
    );
  }

  getAllResults(): any[] {
    if (!this.searchResults) return [];
    
    return [
      ...(this.searchResults.videos || []),
      ...(this.searchResults.recipes || []),
      ...(this.searchResults.applinks || [])
    ];
  }

  getResultIcon(entity: string): string {
    const icons = {
      'video': 'play-circle',
      'recipe': 'restaurant',
      'applink': 'apps'
    };
    return icons[entity] || 'document';
  }

  getResultType(entity: string): string {
    const types = {
      'video': 'Vidéo',
      'recipe': 'Recette',
      'applink': 'Application'
    };
    return types[entity] || 'Contenu';
  }

  // Navigation method
  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  async clickShareApp() {
    // For now, we'll use the Web Share API or fallback to a simple share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Training Day',
          text: 'Découvrez Training Day - Votre coach personnel',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `Découvrez Training Day - Votre coach personnel: ${window.location.origin}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        // You could show a toast here indicating the link was copied
      }
    }
  }
}
