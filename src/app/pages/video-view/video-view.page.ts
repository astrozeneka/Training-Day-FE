import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {catchError, finalize, Subscription} from "rxjs";
import { AlertController, NavController } from '@ionic/angular';
import videojs from 'video.js';
import 'videojs-hls-quality-selector';
import '@videojs/http-streaming';  // Import VHS plugin
import { VideoFormService } from 'src/app/video-form.service';

@Component({
  selector: 'app-video-view',
  template: `
  <ion-header>
    <ion-toolbar>
        <ion-buttons slot="start">
            <app-back-button></app-back-button>
            <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ video?.title }}</ion-title>
    </ion-toolbar>
</ion-header>


<ion-content>
    <!-- Video player container -->
    <div class="video-container">
        <video width="100%" controls *ngIf="video?.file">
            <source [src]="videoUrl" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <video #videoElement [id]="'my-video-' + videoId" class="video-js" controls preload="auto" *ngIf="video?.hlsUrl">
        </video>
        
        <!-- Loading spinner while video is being fetched -->
        <div class="spinner" *ngIf="!video && false">
            <ion-spinner></ion-spinner>
        </div>

        <!-- Shimmer loading effect while video is being fetched -->
        <div class="shimmer-container" *ngIf="!video">
            <div class="shimmer-video-placeholder"></div>
            <div class="shimmer-content">
                <div class="shimmer-title"></div>
                <div class="shimmer-metadata">
                    <div class="shimmer-metadata-item" *ngFor="let i of [1,2,3]"></div>
                </div>
                <div class="shimmer-text"></div>
                <div class="shimmer-text shimmer-text-short"></div>
            </div>
        </div>
    </div>

    <!-- To navigate back to previous/next video of the program -->
     <div class="program-navigation" *ngIf="video?.extra?.program && mode === 'program'">
      <div class="program-title">
        <ion-icon name="albums-outline"></ion-icon>
        <span>Programme: {{ video?.extra?.program }}</span>
      </div>
      <div class="navigation-buttons">
        <ion-button class="nav-button prev-button" fill="clear" (click)="router.navigateByUrl('/video-view/' + video?.program_previous + '?mode=program')" [disabled]="!video?.program_previous">
          <ion-icon name="arrow-back" slot="start"></ion-icon>
          Prog. précédent
        </ion-button>
        <ion-button class="nav-button next-button" fill="clear" (click)="router.navigateByUrl('/video-view/' + video?.program_next + '?mode=program')" [disabled]="!video?.program_next">
          Prog. suivant
          <ion-icon name="arrow-forward" slot="end"></ion-icon>
        </ion-button>
      </div>
    </div>

    <!-- Video details content -->
    <div class="detail-content" *ngIf="video">
        <!-- Metadata for normal users -->
        <div *ngIf="!user || (user?.function !== 'admin' && user?.function !== 'coach')">
            <!-- Video metadata -->
            <div class="video-metadata" *ngIf="video?.extra">
              <div class="metadata-item" *ngIf="video?.extra?.level">
                  <ion-icon name="fitness-outline"></ion-icon>
                  <span class="metadata-label">Niveau</span>
                  <span class="metadata-value">{{ video?.extra?.level }}</span>
              </div>
              <div class="metadata-item" *ngIf="video?.extra?.duration">
                  <ion-icon name="time-outline"></ion-icon>
                  <span class="metadata-label">Durée</span>
                  <span class="metadata-value">{{ video?.extra?.duration }}</span>
              </div>
              <div class="metadata-item" *ngIf="video?.extra?.calorie">
                  <ion-icon name="flame-outline"></ion-icon>
                  <span class="metadata-label">Calories</span>
                  <span class="metadata-value">{{ video?.extra?.calorie }}</span>
              </div>
            </div>
            
            <!-- Description section -->
            <div class="detail-section" *ngIf="video?.description">
                <h3>Description</h3>
                <p>{{ video?.description }}</p>
            </div>

            <div class="detail-section program-section" *ngIf="video?.extra?.program">
              <h3>Programme</h3>
              <p>{{ video?.extra?.program }}</p>
            </div>

            <div class="detail-section" *ngIf="video?.extra?.program">
              <h3>Autres vidéos du programme</h3>
              
              <!-- Loading state -->
              <div *ngIf="isLoadingProgramVideos" class="loading-container">
                <ion-spinner></ion-spinner>
                <p>Chargement des vidéos...</p>
              </div>
              
              <!-- Program videos list -->
              <div *ngIf="!isLoadingProgramVideos && programVideos.length > 0" class="program-videos-container">
                <div class="program-videos-list">
                  <div class="program-video-item" 
                      *ngFor="let programVideo of programVideos" 
                      [class.current]="programVideo.id === video.id"
                      (click)="navigateToVideo(programVideo.id)">
                    
                    <div class="video-thumbnail" *ngIf="programVideo.thumbnailUrl">
                      <img [src]="programVideo.thumbnailUrl" [alt]="programVideo.title">
                      <div class="play-overlay">
                        <ion-icon name="play-circle-outline"></ion-icon>
                      </div>
                    </div>
                    
                    <div class="video-icon" *ngIf="!programVideo.thumbnailUrl">
                      <ion-icon name="play-circle-outline"></ion-icon>
                    </div>
                    
                    <div class="video-info">
                      <div class="video-name">{{ programVideo.title }}</div>
                      <div class="video-description" *ngIf="programVideo.description">
                        {{ programVideo.description }}
                      </div>
                    </div>
                    
                    <ion-icon name="checkmark-circle" *ngIf="programVideo.id === video.id" class="current-indicator"></ion-icon>
                    <ion-icon name="chevron-forward" *ngIf="programVideo.id !== video.id" class="arrow-icon"></ion-icon>
                  </div>
                </div>
              </div>
              
              <!-- Empty state -->
              <div *ngIf="!isLoadingProgramVideos && programVideos.length === 0" class="empty-state">
                <ion-icon name="videocam-outline" class="empty-icon"></ion-icon>
                <p>Aucune autre vidéo dans ce programme</p>
              </div>
            </div>
        </div>

        <!-- Admin/Coach edit form section -->
        <div *ngIf="user?.function === 'admin' || user?.function === 'coach'">
            <div class="detail-section">
                <h3>Modifier la vidéo</h3>
                <form [formGroup]="form" (submit)="submit($event)">
                    <ion-item>
                        <ion-input
                            label="Titre"
                            label-placement="floating"
                            formControlName="title"
                            [errorText]="displayedError.title"
                        ></ion-input>
                    </ion-item>
                    <!-- Secondary title input -->
                    <ion-item>
                        <ion-input
                            label="Titre secondaire (facultatif)"
                            label-placement="floating"
                            formControlName="sort_field"
                            [errorText]="displayedError.sort_field"
                        ></ion-input>
                    </ion-item>
                    <!-- Description textarea -->
                    <ion-item>
                        <ion-textarea
                            label="Description"
                            formControlName="description"
                            placeholder="Description de la vidéo"
                            [rows]="5"
                            [errorText]="displayedError.description"
                        ></ion-textarea>
                    </ion-item>
                    <!-- The category (same as in video-upload) -->
                    <ion-item>
                      <ion-select
                              formControlName="mainCategory"
                              label="Catégorie principale"
                              label-placement="floating"
                              (ionChange)="onMainCategoryChange($event)"
                      >
                        <ion-select-option value="">Sélectionner une catégorie</ion-select-option>
                        <ion-select-option *ngFor="let category of availableCategories" [value]="category">
                            {{getCategoryLabel(category)}}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                    <!-- The subcategory (same as in video-upload) -->
                    <ion-item>
                      <ion-select
                              formControlName="subCategory"
                              label="Sous-catégorie"
                              label-placement="floating"
                              (ionChange)="onSubCategoryChange($event)"
                              [disabled]="!form.get('mainCategory').value"
                      >
                          <ion-select-option value="">Sélectionner une sous-catégorie</ion-select-option>
                          <ion-select-option *ngFor="let subCategory of availableSubCategories" [value]="subCategory[0]">
                              {{subCategory[1]}}
                          </ion-select-option>
                      </ion-select>
                    </ion-item>
                    <!-- Tags -->
                    <ion-item>
                        <ion-input
                            label="Tags"
                            label-placement="floating"
                            formControlName="tags"
                            [errorText]="displayedError.tags"
                        ></ion-input>
                    </ion-item>
                    <!--
                    <ion-item>
                        <ion-select
                            formControlName="category"
                            label="Categorie"
                            label-placement="floating"
                        >
                        <ion-select-option value="undefined">Non défini</ion-select-option>
                        <ion-select-option value="training">Training</ion-select-option>
                        <ion-select-option value="training/corps-entier">Training > Corps entier</ion-select-option>
                        <ion-select-option value="training/bras">Training > Bras et épaules</ion-select-option>
                        <ion-select-option value="training/abdos">Training > Abdos</ion-select-option>
                        <ion-select-option value="training/jambes">Training > Jambes</ion-select-option>
                        <ion-select-option value="training/fessiers">Training > Fessiers</ion-select-option>
                        <ion-select-option value="training/pectoraux">Training > Pectoraux</ion-select-option>
                        <ion-select-option value="training/dos">Training > Dos</ion-select-option>
        
                        <ion-select-option value="boxing">Boxing</ion-select-option>
                        <ion-select-option value="boxing/base">Boxing > Base</ion-select-option>
                        <ion-select-option value="boxing/poings">Boxing > Poings</ion-select-option>
                        <ion-select-option value="boxing/pieds-genoux">Boxing > Pieds et genoux</ion-select-option>
                        <ion-select-option value="boxing/pieds-poings-genoux">Boxing > Pieds, poings et genoux</ion-select-option>
                        </ion-select>
                    </ion-item>
                    -->
                    <ion-item>
                        <ion-select
                            label="Visibilité"
                            label-placement="floating"
                            formControlName="hidden"
                        >
                            <ion-select-option [value]="0">Publique</ion-select-option>
                            <ion-select-option [value]="1">Privée</ion-select-option>
                        </ion-select>
                    </ion-item>
                    <!-- Privilege selection -->
                    <ion-item>
                        <ion-select
                            formControlName="privilege"
                            label="Privilège requis"
                            label-placement="floating"
                        >
                          <ion-select-option value='public,hoylt,gursky,smiley,moreno,alonzo'>Tout le monde</ion-select-option>
                          <ion-select-option value='hoylt,gursky,smiley,moreno,alonzo'>Hoylt ou supérieur</ion-select-option>
                          <ion-select-option value="gursky,smiley,moreno,alonzo">Gursky/Smiley ou supérieur</ion-select-option>
                          <ion-select-option value="alonzo">Alonzo</ion-select-option>
                        </ion-select>
                    </ion-item>

                    <!-- IsExercise checkbox -->
                    <ion-item>
                      <ion-checkbox formControlName="isExercise">Afficher comme exercice</ion-checkbox>
                    </ion-item>

                    <!-- Program selection -->
                    <ion-item>
                      <ion-select
                        formControlName="program"
                        label="Programme"
                        label-placement="floating"
                        (ionChange)="onProgramChange($event)"
                        [disabled]="!form.get('category').value || form.get('category').value === 'undefined'"
                      >
                        <ion-select-option *ngFor="let option of availableProgramOptions" [value]="option.value">
                          {{option.label}}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Custom program input (shown only when "Autres" is selected) -->
                    <ion-item *ngIf="showCustomProgram">
                      <ion-input
                        label="Nom du programme"
                        label-placement="floating"
                        formControlName="customProgram"
                        placeholder="Entrez le nom du programme"
                      ></ion-input>
                    </ion-item>

                    <!-- Metainformation: level -->
                    <ion-item>
                      <ion-select
                        formControlName="level"
                        label="Niveau"
                        label-placement="floating"
                      >
                        <ion-select-option value="">Non spécifié</ion-select-option>
                        <ion-select-option value="debutant">Débutant</ion-select-option>
                        <ion-select-option value="intermediaire">Intermédiaire</ion-select-option>
                        <ion-select-option value="avance">Avancé</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Metainformation: duration -->
                    <ion-item>
                      <ion-input
                        type="number"
                        label="Durée (minutes)"
                        label-placement="floating"
                        formControlName="duration"
                        placeholder="Durée de l'entraînement en minutes"
                      ></ion-input>
                    </ion-item>

                    <!-- Metainformation: calories -->
                    <ion-item>
                      <ion-input
                        type="number"
                        label="Calories"
                        label-placement="floating"
                        formControlName="calorie"
                        placeholder="Calories brûlées estimées"
                      ></ion-input>
                    </ion-item>

                    <!-- Action buttons -->
                    <div class="form-actions">
                        <app-ux-button
                            expand="block"
                            [disabled]="!formValid"
                            shape="round"
                            [loading]="isFormLoading"
                        >
                            Mettre à jour
                        </app-ux-button>
                    </div>
                </form>
            </div>

            <!-- Delete section -->
            <div class="detail-section danger-zone">
                <h3>Supprimer la vidéo</h3>
                <div class="delete-action">
                    <ion-button 
                        (click)="deleteVideo()" 
                        shape="round" 
                        color="danger"
                        expand="block"
                    >Supprimer la vidéo</ion-button>
                </div>
            </div>
        </div>
    </div>
</ion-content>
`,
  styles: [`
    
.video-container {
    background: rgba(128, 128, 128, 0.136);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 0;
}

.video-container video,
.video-container .video-js {
    width: 100%;
    max-width: 100%;
    background: rgba(0, 0, 0, 0.8);
}


// unused
.spinner {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
}

.detail-content {
    padding: 22px;
    background-color: var(--ion-color-light);
}

.video-metadata {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap; 
    padding: 16px 12px;
    background-color: var(--ion-color-light);
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    gap: 12px;
}

.metadata-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 80px;
    padding: 8px 4px;
}

.metadata-item ion-icon {
    font-size: 24px;
    color: var(--ion-color-primary);
    margin-bottom: 4px;
}

.metadata-label {
    font-size: 11px;
    color: var(--ion-color-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.metadata-value {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    color: var(--ion-color-dark);
}

.detail-section {
    margin-bottom: 24px;
}

.detail-section h3 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--ion-color-dark);
}

.detail-section p {
    margin: 0;
    color: var(--ion-color-medium);
    line-height: 1.5;
    margin-bottom: 8px;
}

ion-item {
    --padding-start: 0;
    --background: transparent;
    margin-bottom: 12px;
}

.form-actions {
    margin-top: 20px;
    margin-bottom: 20px;
}

.danger-zone {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(var(--ion-color-danger-rgb), 0.2);
}

.delete-action {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

/* Video JS custom styling */
.video-js {
    min-height: 250px;
}

.video-js .vjs-control-bar {
    background-color: rgba(var(--ion-color-dark-rgb), 0.7);
}

.video-js .vjs-big-play-button {
    background-color: var(--ion-color-primary);
    border-color: var(--ion-color-primary);
}

/* The program navigation section */
.program-navigation {
  background-color: var(--ion-color-light-shade);
  padding: 16px;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.program-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.program-title ion-icon {
  color: var(--ion-color-primary);
  font-size: 20px;
  margin-right: 8px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
}

.nav-button {
  --color: var(--ion-color-primary);
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 14px;
  font-weight: 500;
}

.prev-button {
  margin-right: auto;
}

.next-button {
  margin-left: auto;
}

/* If the program section exists, remove it since we're showing it in the navigation */
.program-section {
  display: none;
}

/* Shimmer loading styles */
.shimmer-container {
    width: 100%;
}

.shimmer-video-placeholder {
    width: 100%;
    height: 250px;
    margin-bottom: 0;
    position: relative;
    overflow: hidden;
}

.shimmer-content {
    padding: 22px;
    background-color: var(--ion-color-light);
}

.shimmer-title {
    height: 24px;
    width: 70%;
    margin-bottom: 20px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.shimmer-metadata {
    display: flex;
    justify-content: space-between;
    padding: 16px 12px;
    background-color: var(--ion-color-light);
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.shimmer-metadata-item {
    height: 60px;
    flex: 1;
    margin: 0 8px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.shimmer-text {
    height: 16px;
    width: 100%;
    margin-bottom: 12px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.shimmer-text-short {
    width: 60%;
}

.shimmer-video-placeholder,
.shimmer-title,
.shimmer-metadata-item,
.shimmer-text {
  background: var(--ion-color-step-200, #e0e0e0);
}

/* Common shimmer animation for all shimmer elements */
.shimmer-video-placeholder::after,
.shimmer-title::after,
.shimmer-metadata-item::after,
.shimmer-text::after {
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

/* Program videos section - consistent with exercise-list styling */
.program-videos-container {
  margin-top: 16px;
}

.program-videos-list {
  background-color: var(--ion-color-light);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.program-video-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: var(--ion-color-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover:not(.current) {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  &.current {
    background-color: rgba(var(--ion-color-primary-rgb), 0.1);
    border-left: 4px solid var(--ion-color-primary);
    padding-left: 12px; // Adjust for border
  }
  
  .video-thumbnail {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    
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
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
  }
  
  .video-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: var(--ion-color-primary-tint);
    margin-right: 16px;
    flex-shrink: 0;
    
    ion-icon {
      font-size: 20px;
      color: var(--ion-color-primary);
    }
  }
  
  .video-info {
    flex: 1;
    min-width: 0; // Allows text truncation
    
    .video-name {
      color: var(--ion-color-dark);
      font-weight: 500;
      font-size: 16px;
      line-height: 1.3;
      margin-bottom: 4px;
      
      // Limit to 2 lines
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .video-description {
      color: var(--ion-color-medium);
      font-size: 14px;
      line-height: 1.4;
      
      // Limit to 2 lines
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .current-indicator {
    color: var(--ion-color-primary);
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .arrow-icon {
    color: var(--ion-color-medium);
    font-size: 18px;
    flex-shrink: 0;
  }
}

/* Loading and empty states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  
  ion-spinner {
    margin-bottom: 16px;
  }
  
  p {
    color: var(--ion-color-medium);
    margin: 0;
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
    margin: 0;
  }
}

/* Mobile responsiveness */
@media screen and (max-width: 480px) {
  .program-video-item {
    padding: 12px;
    
    .video-thumbnail,
    .video-icon {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }
    
    .video-thumbnail .play-overlay {
      font-size: 1rem;
    }
    
    .video-icon ion-icon {
      font-size: 18px;
    }
    
    .video-info {
      .video-name {
        font-size: 14px;
      }
      
      .video-description {
        font-size: 13px;
      }
    }
    
    .current-indicator,
    .arrow-icon {
      font-size: 16px;
    }
  }
}

    `],
  styleUrls: [
  ],
  encapsulation: ViewEncapsulation.Emulated // Add this line to change style scope
})
export class VideoViewPage implements OnInit, AfterViewInit {
  videoUrl:any = null
  videoId:any = null
  video:any = null
  user:any = null

  form = new FormGroup({
    'title': new FormControl('', [Validators.required]),
    'description': new FormControl('', [Validators.required]),
    'tags': new FormControl('', []),

    'mainCategory': new FormControl('', []),
    'subCategory': new FormControl('', []),
    'category': new FormControl('undefined', []),

    'privilege': new FormControl(['public', 'hoylt', 'moreno', 'alonzo'], []),
    'hidden': new FormControl(false, []),
    'sort_field': new FormControl('', []),

    // Required for the 'exercise'/'program' features
    'isExercise': new FormControl(false),
    'program': new FormControl('none'),
    'customProgram': new FormControl(''),

    // new controls for extra_data
    'level': new FormControl('', []),
    'duration': new FormControl('', []),
    'calorie': new FormControl('', []),
    'material': new FormControl('', [])
  })
  displayedError = {
    'title': undefined,
    'description': undefined,
    'tags': undefined,
    'category': undefined,
    'privilege': undefined,
    'sort_field': undefined,
    // 'hidden': undefined
  }
  formValid = false
  isFormLoading = false

  programVideos: any[] = [];
  isLoadingProgramVideos = false;

  // The video element reference
  @ViewChild('videoElement', { static: false }) videoElement:any = undefined
  videoPlayer: any; // A video-js object

  // The URL get parameter
  mode: 'exercise' | 'program' | null = null;
  private routeParameterSubscription = new Subscription();

  // To handle restricted video (to manage later)
  //isVideoUnavailable = false;
  //requiredSubscription = '';

  // TO keep track if the custom program text is displayed
  showCustomProgram:boolean = false;// Store all programs by category

  // Store all programs by category
  programHierarchy: { [category: string]: string[] } = {};
  // Store available program options for the selected category
  availableProgramOptions: { value: string, label: string }[] = [
    { value: 'none', label: 'Pas inclus dans un programme' },
    { value: 'other', label: 'Autres' }
  ];

  // To manage the maincategory/subcategory hierarchy
  // TODO: Refactor this to use a service
  categoryHierarchy: { [category: string]: [string, string][] } = {};
  availableCategories: string[] = [];
  availableSubCategories: [string, string][] = [];

  constructor(
    public router: Router,
    public contentService: ContentService,
    public feedbackService: FeedbackService,
    public route: ActivatedRoute,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private vfs: VideoFormService,
    private navCtrl: NavController
  ) {
    this.videoId = this.route.snapshot.paramMap.get('id')
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
        
      }
    })
    this.form.valueChanges.subscribe((value)=>{
      this.formValid = this.form.valid
    })
  }

  ngOnInit() {
    // Fetch the category hierarchy
    this.vfs.fetchCategoryHierarchy()
      .subscribe((response: any) => {
        this.categoryHierarchy = response;
        this.availableCategories = Object.keys(this.categoryHierarchy);
      })
    
    // Fetch the program hierarchy
    this.vfs.fetchProgramHierarchy()
      .subscribe((response: any) => {
        this.programHierarchy = response;
      });

    // Subscribe to query parameter changes
    this.routeParameterSubscription.add(
      this.route.queryParamMap.subscribe(params => {
        this.mode = params.get('mode') as 'exercise' | 'program' | null;
        // Handle mode changes
      })
    );
  }




  ngOnDestroy(){
    this.routeParameterSubscription.unsubscribe();
  }

  async ionViewWillEnter() {
    // Run each time the user enters the page
    this.user = await this.contentService.storage.get('user')
    await this.contentService.storage.get('token')
    this.contentService.getOne(`/video-details/${this.videoId}`, {}).subscribe((res:any)=>{
      this.video = res

      if (this.video.file){
        // The old way (Back-end server) of loading videos
        this.videoUrl = environment.rootEndpoint + '/' + this.video.file.permalink
      } else if (this.video.hlsUrl) {
        // The new way (AWS S3) of loading videos
        console.log("HLS Url detected")
        this.videoUrl = this.video.hlsUrl
      }
      this.cdr.detectChanges()
      // Manage the tags by removing the category (training or boxing) from the tags

      let tags = this.video.tags.split(',')
      let category = tags.filter((tag:any)=>tag.includes('training') || tag.includes('boxing'))
      tags = tags.filter((tag:any)=>!tag.includes('training') && !tag.includes('boxing'))
      this.video.tags = tags.join(', ')
      this.video.category = category.pop() // Always the last item of the pile, because the first item is the mother category
        
      // Patch the value (In next steps, fully typed expression should be used)
      this.video.privilege = this.video.privilege.join(',')
      this.form.patchValue(this.video)

      // Manage the reader
      this.initVideoJsReader()

      // Load program videos if this video belongs to a program
      if (this.video?.extra?.program) {
        this.loadProgramVideos(this.video.extra.program);
      }

      // Patch mainCategory and subCategory
      const categoryParts = this.video.category.split('/');
      if (categoryParts.length > 1){
        this.form.get('mainCategory')?.setValue(categoryParts[0]);
        if (categoryParts[0] && this.categoryHierarchy[categoryParts[0]]) {
          // Update available subcategories based on main category
          this.availableSubCategories = this.categoryHierarchy[categoryParts[0]];
          if (categoryParts.length > 1) {
            // Set subCategory if it exists in the hierarchy
            const subCategory = this.availableSubCategories.find(sub => sub[0] === categoryParts[1]);
            if (subCategory) {
              this.form.get('subCategory')?.setValue(subCategory[0]);
            } else {
              // If subcategory not found, reset it
              this.form.get('subCategory')?.setValue('');
            }

            // Load the program options based on the selected category
            this.updateProgramOptions(`${categoryParts[0]}/${categoryParts[1]}`);
          }
        }
      }

      // Patch program
      setTimeout(() => {
        this.form.get("program")?.setValue(this.video.extra?.program || 'none');
        console.log("Program set to:", this.form.get("program")?.value);
      }, 1000);

      // isExercuse and program handling
      this.form.get('isExercise')?.setValue(this.video.extra?.isExercise || false);
      this.form.get('program')?.setValue(this.video.extra?.program || 'none');
      this.showCustomProgram = this.form.get('program')?.value === 'other';
      this.form.get('customProgram')?.setValue(this.video.extra?.program || '');

      // Patch the extra data
      this.form.get('level')?.setValue(this.video.extra?.level || '');
      this.form.get('duration')?.setValue(this.video.extra?.duration || '');
      this.form.get('calorie')?.setValue(this.video.extra?.calorie || '');
    })
  }

  ngAfterViewInit(){
    // this.setVideoJsReader()
    console.log("videoElement", this.videoElement)
  }

  initVideoJsReader(){
    // Manage the VideoJS reader
    let videoElement = this.videoElement.nativeElement as HTMLVideoElement
    this.videoPlayer = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      sources: (
        [
          {
            src: this.videoUrl,
            type: 'application/x-mpegURL'
          }
        ] as any
      )
    })
    // Manage video styles
    this.videoPlayer.hlsQualitySelector();
    // Handling error
    this.videoPlayer.on('error', ()=>{
      console.log('video-js error occured:', this.videoPlayer.error())
    })
  }

  loadProgramVideos(programName: string) {
    this.isLoadingProgramVideos = true;

    this.contentService.getCollection(`/videos/by-program`, 0, {
      program: programName,
      limit: 50
    })
      .pipe(
        catchError((error:any) => {
          console.error('Error loading program videos:', error);
          this.isLoadingProgramVideos = false;
          return [];
        }
      ))
      .subscribe((response:any)=>{
        this.programVideos = response.data || [];
        this.isLoadingProgramVideos = false;
        this.cdr.detectChanges
      })
  }

  navigateToVideo(videoId: number) {
    if (videoId !== this.video.id) {
      this.router.navigate(['/video-view', videoId], { 
        queryParams: { mode: this.mode } 
      });
    }
  }

  submit(event:any){
    event.preventDefault()
    this.isFormLoading = true
    let data:any = this.form.value
    data.id = this.videoId
    data.privilege = data.privilege.split(',')
    
    data.tags = [this.form.value.category, ...data.tags.split(',')]
      .filter(a=>a.trim() !== '')
      .join(',')

    // Prepare extra_data informations
    let program = data.program;
    if (data.program === 'other' && data.customProgram) {
      program = data.customProgram;
    } else if (data.program === 'none') {
      program = null;
    }
    data.extra = {
      isExercise: data.isExercise || false,
      program: program,

      level: data.level || null,
      duration: data.duration || null,
      calorie: data.calorie || null,
      material: data.material || null
    };

    data.video_id = this.video.id
    this.contentService.put('/video', data)
      .pipe(finalize(()=>this.isFormLoading = false)) // WARNING, no validation is present here
      .subscribe((response:any)=>{
        if(response.id){
          this.feedbackService.register('Le vidéo a été mis à jour avec succes', 'success')
          // Go back if possible
          window.history.back()
          

          // this.router.navigate(['/home'])
        }else{
          this.feedbackService.registerNow('Erreur lors de la mise à jour de la vidéo', 'danger')
        }
      })
  }

 async deleteVideo(){
    let alert = await this.alertController.create({
      header: "Supprimer la vidéo",
      message: "Veuillez confirmer la suppression",
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Supprimer',
          cssClass: 'ion-color-danger',
          handler: ()=>{
            this.contentService.delete(`/video`, `${this.videoId}`)
            .subscribe((response:any)=>{
              if(response.message){
                this.feedbackService.register('Le vidéo a été supprimé avec succes', 'success')
                // this.navCtrl.back();
                window.history.back()
              }else{
                this.feedbackService.registerNow('Erreur lors de la suppression de la vidéo', 'danger')
              }
            })
          }
        }
      ]
    })
    await alert.present();
  }

  // To manage the program selection
  onProgramChange(event: any) {
    this.showCustomProgram = event.detail.value === 'other';
    if (!this.showCustomProgram) {
      this.form.get('customProgram')?.reset();
    }

    // Update validators based on program selection
    if (event.detail.value === 'other') {
      this.form.get('customProgram')?.setValidators([Validators.required]);
    } else {
      this.form.get('customProgram')?.clearValidators();
    }
  }

  updateProgramOptions(category: string) {
    // Reset the program selection when category changes
    this.form.get('program').setValue('none');
    
    // Reset available options to defaults
    this.availableProgramOptions = [
      { value: 'none', label: 'Pas inclus dans un programme' },
      { value: 'other', label: 'Autres' }
    ];
    
    // If no category or "undefined" is selected, we're done
    if (!category || category === 'undefined') {
      return;
    }
    
    // Get programs for this category
    if (this.programHierarchy[category]) {
      // Add programs from this category to the options
      this.programHierarchy[category].forEach(program => {
        this.availableProgramOptions.splice(this.availableProgramOptions.length - 1, 0, {
          value: program,
          label: program
        });
      });
    }
    
    // For parent categories like "training" or "boxing", also include programs from subcategories
    if (category === 'training' || category === 'boxing') {
      Object.keys(this.programHierarchy).forEach(key => {
        if (key.startsWith(category + '/') && this.programHierarchy[key]) {
          this.programHierarchy[key].forEach(program => {
            // Check if this program already exists in options
            const exists = this.availableProgramOptions.some(
              option => option.value === program.toLowerCase().replace(/\s+/g, '-')
            );
            
            if (!exists) {
              this.availableProgramOptions.splice(this.availableProgramOptions.length - 1, 0, {
                value: program.toLowerCase().replace(/\s+/g, '-'),
                label: program
              });
            }
          });
        }
      });
    }
  }

  // Get display label for main category
  getCategoryLabel(category: string): string {
    // Capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Handle main category change
  onMainCategoryChange(event: any) {
    const selectedCategory = event.detail.value;
    
    // Reset subcategory and program
    this.form.get('subCategory').setValue('');
    this.form.get('program').setValue('none');
    
    // Update available subcategories
    if (selectedCategory && this.categoryHierarchy[selectedCategory]) {
      this.availableSubCategories = this.categoryHierarchy[selectedCategory];
    } else {
      this.availableSubCategories = [];
    }
    
    // If we only have one subcategory, select it automatically
    if (this.availableSubCategories.length === 1) {
      this.form.get('subCategory').setValue(this.availableSubCategories[0][0]);
      this.updateCategoryValue();
    }
  }

  // Handle subcategory change
  onSubCategoryChange(event: any) {
    this.updateCategoryValue();
    
    // Reset and update program selection
    this.form.get('program').setValue('none');
    const mainCategory = this.form.get('mainCategory').value;
    const subCategory = event.detail.value;
    
    if (mainCategory && subCategory) {
      this.updateProgramOptions(`${mainCategory}/${subCategory}`);
    }
  }

  // Update the category value based on main and subcategory
  updateCategoryValue() {
    const mainCategory = this.form.get('mainCategory').value;
    const subCategory = this.form.get('subCategory').value;
    
    if (mainCategory && subCategory) {
      this.form.get('category').setValue(`${mainCategory}/${subCategory}`);
    } else if (mainCategory) {
      this.form.get('category').setValue(mainCategory);
    } else {
      this.form.get('category').setValue('');
    }
  }

}
