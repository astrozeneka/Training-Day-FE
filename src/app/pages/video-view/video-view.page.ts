import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {finalize, Subscription} from "rxjs";
import { AlertController } from '@ionic/angular';
import videojs from 'video.js';
import 'videojs-hls-quality-selector';
import '@videojs/http-streaming';  // Import VHS plugin

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
        <div class="spinner" *ngIf="!video">
            <ion-spinner></ion-spinner>
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
              <div class="metadata-item" *ngIf="video?.extra?.calories">
                  <ion-icon name="flame-outline"></ion-icon>
                  <span class="metadata-label">Calories</span>
                  <span class="metadata-value">{{ video?.extra?.calories }}</span>
              </div>
            </div>
            
            <!-- Description section -->
            <div class="detail-section" *ngIf="video?.description">
                <h3>Description</h3>
                <p>{{ video?.description }}</p>
                {{ mode }}
            </div>

            <div class="detail-section program-section" *ngIf="video?.extra?.program">
              <h3>Programme</h3>
              <p>{{ video?.extra?.program }}</p>
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
                    <ion-item>
                        <ion-input
                            label="Titre secondaire (facultatif)"
                            label-placement="floating"
                            formControlName="sort_field"
                            [errorText]="displayedError.sort_field"
                        ></ion-input>
                    </ion-item>
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
                    <ion-item>
                        <ion-textarea
                            label="Description"
                            formControlName="description"
                            placeholder="Description de la vidéo"
                            [rows]="5"
                            [errorText]="displayedError.description"
                        ></ion-textarea>
                    </ion-item>
                    <ion-item>
                        <ion-input
                            label="Tags"
                            label-placement="floating"
                            formControlName="tags"
                            [errorText]="displayedError.tags"
                        ></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-select
                            formControlName="privilege"
                            label="Privilège requis"
                            label-placement="floating"
                        >
                            <ion-select-option value='public,hoylt,moreno,alonzo'>Tout le monde</ion-select-option>
                            <ion-select-option value='hoylt,moreno,alonzo'>Hoylt ou supérieur</ion-select-option>
                            <ion-select-option value="moreno,alonzo">Moreno ou supérieur</ion-select-option>
                            <ion-select-option value="alonzo">Alonzo</ion-select-option>
                        </ion-select>
                    </ion-item>
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

    `],
  styleUrls: [
    "../../../../node_modules/video.js/dist/video-js.css"
  ],
    encapsulation: ViewEncapsulation.None // Add this line to change style scope
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
    'category': new FormControl('undefined', []),
    'privilege': new FormControl(['public', 'hoylt', 'moreno', 'alonzo'], []),
    'hidden': new FormControl(false, []),
    'sort_field': new FormControl('', [])
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

  // The video element reference
  @ViewChild('videoElement', { static: false }) videoElement:any = undefined
  videoPlayer: any; // A video-js object

  // The URL get parameter
  mode: 'exercise' | 'program' | null = null;
  private routeParameterSubscription = new Subscription();

  constructor(
    public router: Router,
    public contentService: ContentService,
    public feedbackService: FeedbackService,
    public route: ActivatedRoute,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    this.videoId = this.route.snapshot.paramMap.get('id')
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url.includes('/video-view')){
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

          // THe older way to patch value (should be removed later)
          /*
          this.form.patchValue({
            title: this.video.title,
            description: this.video.description,
            tags: this.video.tags,
            category: this.video.category,
            privilege: this.video.privilege.join(','),
            hidden: this.video.hidden
          })*/
        })
      }
    })
    this.form.valueChanges.subscribe((value)=>{
      this.formValid = this.form.valid
    })
  }

  ngOnInit() {
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

  submit(event:any){
    event.preventDefault()
    this.isFormLoading = true
    let data:any = this.form.value
    data.id = this.videoId
    data.privilege = data.privilege.split(',')
    
    data.tags = [this.form.value.category, ...data.tags.split(',')]
      .filter(a=>a.trim() !== '')
      .join(',')

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

}
