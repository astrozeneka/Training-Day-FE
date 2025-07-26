import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, from, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-training-program-selection',
  template: `
<ion-header>
  <ion-toolbar>
      <ion-buttons slot="start">
          <app-back-button></app-back-button>
          <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>Training</ion-title>
  </ion-toolbar>
</ion-header>
<ion-content>

  <div class="video-home">
    <div class="ion-padding-horizontal">
      <div class="title">
        Choisis ton option
      </div>
      <div class="subtitle">
        Les abonnés Hoylt ont le choix entre deux options de programmes d'entraînement.
      </div>
    </div>

    {{ user.user_settings | json }}

    <div class="card-list">
      <!-- Training everyday -->
      <div class="tool-card enhanced-tool-card ">
        <div class="image-container">
          <img title="Training of the day" src="../../../assets/medias/rounded-cards/sample-image-training-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>Explore des programmes sportifs adaptés à ton niveau et construits autour de tes objectifs personnels.</p>
          <h3>Training of the day</h3>
          <ion-button style="align-self: stretch;" expand="block" (click)="selectCategory('training')" [disabled]="formIsSubmitting || userIsLoading">
            <span *ngIf="!(formIsSubmitting && selectedOption == 'training')">Choisir</span>
            <ion-spinner *ngIf="formIsSubmitting && selectedOption === 'training'"></ion-spinner>
          </ion-button>
        </div>
      </div>

      <div class="or-separator">
        <div class="separator-line"></div>
        <span class="separator-text">où</span>
        <div class="separator-line"></div>
      </div>

      <div class="tool-card enhanced-tool-card">
        <div class="image-container">
          <img title="Boxing of the day" src="../../../assets/medias/rounded-cards/sample-image-boxing-of-the-day.jpg" />
        </div>
        <div class="card-description">
          <div class="spacer"></div>
          <p>De l'initiation aux entraînements avancés, progresse en boxe selon tes objectifs personnels.</p>
          <h3>Boxing of the day</h3>
            <ion-button style="align-self: stretch;" expand="block" (click)="selectCategory('boxing')" [disabled]="formIsSubmitting || userIsLoading">
              <span *ngIf="!(formIsSubmitting && selectedOption == 'boxing')">Choisir</span>
              <ion-spinner *ngIf="formIsSubmitting && selectedOption === 'boxing'"></ion-spinner>
            </ion-button>
        </div>
      </div>
    </div>
  </div>

</ion-content>
`,
  styles: [`

  @import '../../../mixins';

.video-home{
  margin-left: 22px; 
  margin-right: 22px;
  margin-bottom: 32px;

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
    //margin-bottom: 2rem;
  }


}
// WARNING, the code is duplicated with tools and in recipes
.enhanced-tool-card {
  height: 200px;
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



.or-separator {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  width: 100%;
  gap: 1rem;
}

.separator-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(176, 83, 34, 0.3), transparent);
  position: relative;
}

.separator-text {
  font-size: 16px;
  font-weight: 500;
  color: rgba(176, 83, 34, 0.8);
  //background: var(--ion-color-background, #fff);
  padding: 0 1rem;
  text-transform: lowercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

    `]
})
export class TrainingProgramSelectionPage implements OnInit {

  userIsLoading: boolean = true;
  user: User;

  formIsSubmitting: boolean = false;
  selectedOption: string = ''; // Used to track the ui button spinner only
  
  // Pusher client and Echo instance
  // bearer token is required for registering the pusher client
  private bearerToken$: Observable<string>;

  constructor(
    private contentService: ContentService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngOnInit() {


    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );

    // Load user data
    this.loadUserData();
  }

  selectCategory(category: string) {
    this.selectedOption = category; // Set the selected option for UI feedback
    // Set the user settings to add training-option=category
    this.bearerToken$.pipe(
      switchMap((token) => {
        let header = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
        this.formIsSubmitting = true;
        return this.http.put(`${environment.apiEndpoint}/user-settings`, {
          user_id: this.user.id,
          key: 'training-option',
          value: category
        }, { headers: header })
      }),
      catchError(err => {
        this.formIsSubmitting = false;
        return of({success: false});
      })
    ).subscribe(async (res: any) => {
      await this.contentService.reloadUserData()
      console.log('User settings updated successfully', res);
      this.formIsSubmitting = false;
      this.selectedOption = ''; // Reset the selected option after submission

      // TODO: redirect the user to the next page
      //
      //
      //
      // =======================================
      
    })
  }


  // Load user data from the content service
  private loadUserData() {
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user) => {
      console.log("===>GET")
      this.user = user;
      this.userIsLoading = false;
      this.cdRef.detectChanges();
    });
  }
}
