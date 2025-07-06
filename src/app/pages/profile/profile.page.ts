import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {catchError, filter, finalize, from, merge, Observable, of, switchMap, throwError} from "rxjs";
import {FeedbackService} from "../../feedback.service";
import {FormComponent} from "../../components/form.component";
import {AlertController, ModalController, Platform} from "@ionic/angular";
import {
  PasswordConfirmationModalComponent
} from "../../components/password-confirmation-modal/password-confirmation-modal.component";
import {navigate} from "ionicons/icons";
import StorePlugin from "../../custom-plugins/store.plugin";
import {EntitlementReady} from "../../abstract-components/EntitlementReady";
import { ConvertHeicToJpegResult, FilePicker, PickImagesResult } from '@capawesome/capacitor-file-picker';
import { PhonePrefixSelectComponent } from 'src/app/components-submodules/phone-prefix-select/phone-prefix-select.component';
import { OnboardingService } from 'src/app/onboarding.service';


@Component({
  selector: 'app-profile',
  template: `
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-buttons slot="start">
        <app-back-button></app-back-button>
        <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>Mon profil</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">

  <form [formGroup]="form">

    <div class="profile-image-container">
      <ion-avatar>
        <img *ngIf="!profile_image && entity?.profile_image?.permalink"
          [src]="getStaticUrl(entity?.profile_image?.permalink)"
             alt="Profile picture"
        />
        <img *ngIf="!profile_image && !entity?.profile_image?.permalink" src="/assets/samples/profile-default-01.png" alt="Profile image"/>
        <img *ngIf="profile_image" [src]="profile_image.base64" alt="Profile image"/>
      </ion-avatar>
      <input type="file"
             name="profile_image"
             style="display: none"
             #fileInput
             (change)="handleFileInput($event)"
             accept="image/*"
      /><!-- This way of handling input doesn't work anymore in the new update of iOS -->
      <ion-button size="small" color="medium" (click)="selectImage()">
        Sélectionner une image
        <ion-icon slot="end" name="cloud-upload-outline"></ion-icon>
      </ion-button>
    </div>
    
    <!-- The form below is redundant -->
      <form [formGroup]="form">
          <ion-item>
              <ion-input
                      label="Prénom"
                      label-placement="floating"
                      formControlName="firstname"
                      [errorText]="displayedError.firstname"
              ></ion-input>
          </ion-item>
          <ion-item>
              <ion-input
                      label="Nom"
                      label-placement="floating"
                      formControlName="lastname"
                      [errorText]="displayedError.lastname"
              ></ion-input>
          </ion-item>
          <ion-item>
              <!-- The email cannot be updated -->
              <ion-input
                      label="Email"
                      label-placement="floating"
                      formControlName="email"
                      [errorText]="displayedError.email"
                      readonly
              ></ion-input>
          </ion-item>
          <ion-item>
              <ion-input
                      type="password"
                      label="Changer l'ancien mot de passe"
                      label-placement="floating"
                      formControlName="password"
                      [errorText]="displayedError.password"
              ></ion-input>
          </ion-item>
          <ion-item>
              <ion-input
                      type="password"
                      label="Confirmez le mot de passe"
                      label-placement="floating"
                      formControlName="password_confirm"
                      [errorText]="displayedError.password_confirm"
              ></ion-input>
          </ion-item>
          <ion-item>
            <div class="phone-input-wrapper">
                <app-phone-prefix-select
                    justify="end"
                    label="Indicatif"
                    labelPlacement="stacked"
                    formControlName="phone_prefix"
                ></app-phone-prefix-select>
                <ion-input
                        label="Téléphone"
                        label-placement="floating"
                        formControlName="phone"
                        [errorText]="displayedError.phone"
                ></ion-input>
            </div>
          </ion-item>
          <ion-item>
              <ion-input
                      label="Adresse"
                      label-placement="floating"
                      formControlName="address"
                      [errorText]="displayedError.address"
              ></ion-input>
          </ion-item>

        <div class="city-postal-code">
        <ion-item>
          <ion-input
            label="Ville"
            label-placement="floating"
            formControlName="city"
            [errorText]="displayedError.city"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="Code postal"
            label-placement="floating"
            formControlName="postal_code"
            [errorText]="displayedError.postal_code"
          ></ion-input>
        </ion-item>
      </div>
      </form>

    <div class="ion-padding ion-text-center">
        <app-ux-button
            (click)="submit()"
            [loading]="formIsLoading"
            [fixedWidth]="true"
        >
            Mettre à jour
        </app-ux-button>
    </div>
  </form>

  <div *ngIf="entity?.extra_data" class="ion-padding-horizontal">
    <h3 class="display-1 ion-padding">Mes informations</h3>

    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Mes informations physiques</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s2-more-info')">
                Modifier
            </ion-button>
        </div>
        <table class="info-table">
            <tr>
                <td>Poids</td>
                <td>{{ entity.extra_data.weight }} kg</td>
            </tr>
            <tr>
                <td>Taille</td>
                <td>{{ entity.extra_data.height }} cm</td>
            </tr>
            <tr>
                <td>Age</td>
                <td>{{ entity.extra_data.age }} ans</td>
            </tr>
            <tr>
                <td>Sexe</td>
                <td>{{ sexKeyAccessor(undefined)[entity.extra_data.sex] }}</td>
            </tr>
        </table>
    </div>

    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Mes objectifs</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s3-goal')">
                Modifier
            </ion-button>
        </div>
        <div class="info-table">
            <tr *ngFor="let goal of entity.extra_data.goals">
                <td *ngIf="!goal.includes('Autre')">{{ goal }}</td>
                <td *ngIf="goal.includes('Autre')">{{ goal }}: {{ entity.extra_data.otherGoals }}</td>
            </tr>
        </div>
    </div>
    
    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Mon sommeil</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s4-sleep')">
                Modifier
            </ion-button>
        </div>
        <div class="info-table ">
            <tr><td>{{ entity.extra_data.dailySleepHours }}</td></tr>
        </div>
    </div>
    
    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Mon alimentation et mon hydratation</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s5-food-and-water')">
                Modifier
            </ion-button>
        </div>
        <div class="info-table ">
            <tr><td>Repas</td><td>{{ entity.extra_data.dailyMeals }}</td></tr>
            <tr><td>Consommation d'eau</td><td>{{ entity.extra_data.dailyWater }}</td></tr>
        </div>
    </div>
    
    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Mon activité physique</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s6-activity')">
                Modifier
            </ion-button>
        </div>
        <table class="info-table">
            <tr><td>{{ entity.extra_data.activity?.text }}</td></tr>
        </table>
    </div>

    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Pratique sportif régulière</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s7-do-sport-regularly')">
                Modifier
            </ion-button>
        </div>
        <table class="info-table">
            <tr><td>{{ entity.extra_data.everydaySport }}</td></tr>
        </table>
    </div>

    <div class="info-table-wrapper">
        <div class="info-table-heading">
            <div>Soucis de santé</div>
            <ion-button size="small" fill="clear" shape="round" (click)="updateOnboardingInfo('s8-health-status')">
                Modifier
            </ion-button>
        </div>
        <table class="info-table">
            <tr *ngFor="let condition of entity.extra_data.healthConditions">
                <td *ngIf="!condition.includes('Autre')">{{ condition }}</td>
                <td *ngIf="condition.includes('Autre')">{{ condition }}: {{ entity.extra_data.otherHealthConditions }}</td>
            </tr>
        </table>
    </div>
  </div>

    <div *ngIf="entity">
        <h3 class="display-1 ion-padding">Abonnement</h3>
        <div *ngIf="entity && !entity?.renewable_id && !active_entitled_subscription">
            <div class="span-button ion-padding-horizontal">
                <span>
                    Vous n'avez pas d'abonnement actif.
                </span>
            </div>
        </div>
        <div *ngIf="entity?.renewable_id && active_entitled_subscription">
            <div class="span-button ion-padding-horizontal">
                <span>
                    Vous disposez d'un abonnement <b> {{ entity.renewable_id }}</b>
                </span>
                <ion-button size="small" (click)="presentManageModal()">
                    Gérer
                </ion-button>
            </div>
        </div>
        <div *ngIf="!entity.renewable_id && active_entitled_subscription && is_ios"><!-- Only in IOS -->
            <div class="span-button ion-padding-horizontal">
                <span>
                    Vous disposez actuellement d'un <b>{{ active_entitled_subscription.displayName }}</b> pour cet appareil iOS
                </span>
                <ion-button size="small" (click)="presentManageModal()">
                    Gérer
                </ion-button>
            </div>
        </div>
        <!-- An Android equivalent of the code above should be here (not yet tested) -->
        <div *ngIf="!entity.renewable_id && active_entitled_subscription && is_android">
            <div class="span-button ion-padding-horizontal">
                <span>
                    Vous disposez actuellement d'un <b>{{ active_entitled_subscription.displayName }}</b> pour cet appareil Android
                </span>
                <ion-button size="small" (click)="presentManageModal()" *ngIf="false"><!-- Temporary false, will be upated later -->
                    Gérer
                </ion-button>
            </div>
        </div>
        <div *ngIf="entity.renewable_id && !active_entitled_subscription">
            <div class="span-button ion-padding-horizontal">
                <span>
                    Vous disposez d'un abonnement <b> {{ entity.renewable_id }}</b> pour ce compte utilisateur
                </span>
                <ion-button size="small" (click)="presentManageModal()"><!-- experimental -->
                    Gérer
                </ion-button>
            </div>
        </div>

        <div *ngIf="entity.subscription">
            <!--
                <ion-item>
                    <ion-label>
                        Votre abonnement actuel
                    </ion-label>
                    <ion-note class="text-bigger" slot="end">
                        {{ entity.subscription.label }}
                    </ion-note>
                </ion-item>
                <ion-item>
                    <ion-label>
                        Date d'expiration
                    </ion-label>
                    <ion-note slot="end">
                        {{ entity.expires_at | date }}
                    </ion-note>
                </ion-item>
                <ion-item>
                    <ion-label>
                        Terminer l'abonnement
                    </ion-label>
                    <ion-button slot="end" color="danger" (click)="endSubscription()" *ngIf="entity.subscription_is_active">
                        Annuler l'abonnement
                    </ion-button>
                    <ion-note slot="end" *ngIf="!entity.subscription_is_active">
                        Votre abonnement prendra fin le {{ entity.expires_at | date }}
                    </ion-note>
                </ion-item>
                -->
        </div>
        <div *ngIf="!entity.subscription">
            <!--
            <ion-item>
                <ion-label>
                    Vous n'avez pas d'abonnement actif
                </ion-label>
                <ion-button slot="end" color="primary" (click)="navigate('/subscriptions')">Souscrire</ion-button>
            </ion-item>
            -->
        </div>
    </div>

    <!--<div *ngIf="entity?.renewable_id">
        <h3 class="display-1 ion-padding">Terminer mon abonnement</h3>
        <div class="span-button ion-padding-horizontal">
            <span>
                Vous pouvez terminer votre abonnement à tout moment.
            </span>
            <ion-button size="small" (click)="cancelSubscription()">
                Se désabonner
            </ion-button>
        </div>
    </div>-->

    <!-- The below section has been disabled -->
    <div *ngIf="entity && entity.function === 'customer' && false">
        <h3 class="display-1 ion-padding">Privilèges(s)</h3>
        <div *ngIf="grouped_perishables && grouped_perishables['food-coach']">
            <app-subscription-card
                    [entity]="grouped_perishables['food-coach']"
                    [title]="'Programme alimentaire'"
                    [description]="'Vous pouvez utiliser cette abonnement pour accéder à un programme alimentaire personnalisé de Training-Day.'"
                    [expiresAt]="grouped_perishables['food-coach']['expires_at']"
                    [columns]="false"
            ></app-subscription-card>
        </div>

        <div *ngIf="grouped_perishables && grouped_perishables['sport-coach']">
            <app-subscription-card
                    [entity]="grouped_perishables['sport-coach']"
                    [title]="'Programme Sportif'"
                    [description]="'Vous pouvez utiliser cette abonnement pour accéder à un programme sportif personnalisé de Training-Day.'"
                    [expiresAt]="grouped_perishables['sport-coach']['expires_at']"
                    [columns]="false"
            ></app-subscription-card>
        </div>

        <!-- Temporary unavailable-->
        <!--
        <div *ngIf="grouped_perishables && grouped_perishables['personal-trainer']">
            <app-trainer-card
                    [entity]="grouped_perishables['personal-trainer']"
            ></app-trainer-card>
        </div>
        -->

        <p class="helper ion-padding" *ngIf="Object.keys(grouped_perishables).length === 0">
            Vous pouvez accéder à la boutique via le menu pour souscrire à des abonnements.
        </p>
    </div>

    <div *ngIf="entity && entity.function === 'customer'">
        <h3 class="display-1 ion-padding">Vérification de l'addresse e-mail</h3>
        <div class="span-button ion-padding-horizontal" *ngIf="!entity.email_verified_at ">
            <span>Votre adresse e-mail n'est pas encore vérifié.</span>
            <ion-button size="small" color="primary" (click)="sendVerificationEmail()">Vérifier</ion-button>
        </div>
        <div class="span-button ion-padding-horizontal" *ngIf="entity.email_verified_at">
            <span>Votre adresse e-mail a été vérifiée.</span>
        </div>
    </div>

    <!-- For the coach allowing him to set the "active" status -->
    <div *ngIf="entity?.function === 'coach'">
        <h3 class="display-1 ion-padding">Horaire d'activité</h3>
        <form [formGroup]="activityStatusForm">
            <ion-item>
                <ion-label slot="start">
                    Actif à partir de
                </ion-label>
                <ion-input
                    slot="end"
                    type="time"
                    formControlName="activeFrom"
                    [errorText]="activityStatusDisplayedError.activeFrom"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-label slot="start">
                    Actif jusqu'à
                </ion-label>
                <ion-input
                    slot="end"
                    type="time"
                    formControlName="activeTo"
                    [errorText]="activityStatusDisplayedError.activeTo"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>Pause</ion-label>
                <ion-select 
                    slot="end" 
                    formControlName="pauseDays"
                >
                    <ion-select-option value="[6]">Samedi</ion-select-option>
                    <ion-select-option value="[0]">Dimanche</ion-select-option>
                    <ion-select-option value="[6,0]">Samedi et Dimanche</ion-select-option>
                    <ion-select-option value="[]">Pas de pause</ion-select-option>
                </ion-select>
                <ion-text color="danger" *ngIf="activityStatusDisplayedError.pauseDays && activityStatusForm.get('pauseDays').touched">
                    {{ activityStatusDisplayedError.pauseDays }}
                </ion-text>
            </ion-item>
            <div class="ion-text-center" *ngIf="activityStatusForm.touched">
                <app-ux-button
                    shape="round"
                    fill="outline"
                    (click)="submitActivityStatusForm()"
                    [disabled]="activityStatusForm.invalid"
                >
                    Appliquer les modifications
                </app-ux-button>
            </div>
        </form>
    </div>

    <div class="ion-padding">
        <h3 class="display-1">Suppression du compte</h3>
        <div class="span-button ion-padding-bottom">
            <span>
                Vous pouvez supprimer votre compte à tout moment. Cette action est irréversible.
            </span>
        </div>
        <div class="ion-text-center">
            <ion-button (click)="deleteAccount()" color="danger">Supprimer mon compte</ion-button>
        </div>
    </div>

    <div class="ion-padding">
        <div *ngIf="true">
            <ion-button (click)="contentService.logout()" expand="full" fill="clear" color="danger">Se déconnecter</ion-button>
        </div>
    </div>

    <app-button-to-chat></app-button-to-chat>
      <app-bottom-navbar-placeholder></app-bottom-navbar-placeholder>
</ion-content>
`,
  styles: [`

@import "../../../mixins";

.profile-image-container{
  text-align: center !important;
  @include v-padding;

  & ion-avatar{
    margin: auto;
    width: 180pt;
    height: 180pt;
  }
  img{
    margin: auto;
  }
}

.text-bigger{
  font-size: .9rem;
  font-weight: 600;
}

ion-item b{
  padding-left: .2em;
}


// WARNING, THE CODE BELOW IS REUSED
.phone-input-wrapper{
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  & app-phone-prefix-select{
      min-width: 200px;
  }
}

// formerly ion-item including a slot='end'
.span-button{
  // padding-left: 24px;
  // padding-right: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  & > span{
    flex-grow: 1;
    font-size: 0.85em;
    display: inline-block;
    height: 100%;
  }
  & ion-button{
    text-transform: none;
  }
}

/**
 * The info-table (!! warning, THE CODE BELOW IS REUSED by user-view.component !!)
 */

.info-table-wrapper{
  padding-top: 15px;
  padding-bottom: 5px;
}

.info-table-heading{
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;

  & > div{
    font-weight: 600;
  }
}

.info-table{
  & {
    width: 100%;
    border-collapse: collapse;
    //background: #fff;
    overflow: hidden;
    // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  & tr {
      display: flex;
      justify-content: space-between;
      padding: 5px;
      border-bottom: 1px solid var(--ion-color-darkgrey);
  }

  & tr:last-child {
      border-bottom: none;
  }

  & td {
      padding: 5px;
      font-size: 16px;
      color: var(--ion-color-darkgrey);
  }

  & td:first-child {
      // font-weight: bold;
      color: var(--ion-color-dark);
  }
}`]
})
export class ProfilePage extends FormComponent implements OnInit {
  entitlementComponent = new EntitlementReady()
  active_entitled_subscription = null

  override form:any = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email]), // readonly
    'password': new FormControl(''),
    'password_confirm': new FormControl(''),
    'firstname': new FormControl('', [Validators.required]),
    'lastname': new FormControl('', [Validators.required]),
    'phone_prefix': new FormControl('+33', [Validators.required]),// I don't know the default value doen't work
    'phone': new FormControl(''),
    'address': new FormControl(''),
    'city': new FormControl('', [Validators.required]),
    'postal_code': new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)])
  });
  override displayedError = {
    'email': undefined, // read only
    'password': undefined,
    'password_confirm': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'phone': undefined,
    'address': undefined,
    'city': undefined,
    'postal_code': undefined
  }
  formIsLoading:boolean = false;

  user_id: any = null;
  entity: any = null;
  old_profile_picture: any = null;
  grouped_perishables: { [key: string]: any; } = {
  };

  // 7. Platform variable
  is_ios = false;
  is_android = false;

  // 8. Sending verification Email
  verificationEmailIsLoading: boolean = false;

  // 9. Sex attribute key accessor
  sexKeyAccessor = (option: any) => { return { "male": "Homme", "female": "Femme" }}

  constructor(
    private router:Router,
    public contentService: ContentService,
    private feedbackService: FeedbackService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private alertCtrl: AlertController,
    private cs: ContentService,
    private os: OnboardingService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    router.events.subscribe(async(event: any)=>{ // This way of loading data is not suitable for angular
      if (event instanceof NavigationEnd && event.url == '/profile') {
        this.entity = await this.contentService.storage.get('user')
        // Define one dictionnary by mapping the this.entity.grouped_perishables
        this.grouped_perishables = this.entity.grouped_perishables.reduce((acc:any, item:any)=>{
          acc[item.slug] = item
          return acc
        }, {})
        console.log(this.grouped_perishables)
        this.user_id = this.entity?.id
        let {prefix, number} = PhonePrefixSelectComponent.preparePhoneNumber(this.entity.phone)
        this.form.patchValue({
          ...this.entity,
          phone_prefix: prefix,
          phone: number
        })
      }
    });

    (async()=>{
      await this.entitlementComponent.loadEntitlements()
      this.active_entitled_subscription = this.entitlementComponent.active_entitled_subscription
    })();

    // 7. Platform variable
    this.is_ios = this.platform.is('capacitor') && this.platform.is('ios');
    this.is_android = this.platform.is('capacitor') && this.platform.is('android');

    // 8. Synchronize the extra_data from the onboaring service
    /*this.os.onOnboardingData()
      .pipe(
        filter((data)=>data instanceof Object)
      )
      .subscribe((data) => {
        console.log("onOnboardingData", data, data instanceof Object)
        // this.entity.extra_data = data
      })*/
  }

  ngOnInit() {
    // This is the new way to retrieve user data from local
    this.contentService.userStorageObservable.getStorageObservable().subscribe(async(user)=>{
      this.entity = user // This is the correct way
      // The other function should't be used in this component
      if(this.entity?.user_settings){
        this.activityStatusForm.patchValue(this.entity.user_settings)
      }

      // Handle json extra_data
      if (typeof(this.entity?.extra_data ) == "string"){
        this.entity.extra_data = this.entity.extra_data ? JSON.parse(this.entity.extra_data) : null
        this.os.onboardingData.set(this.entity.extra_data).then(()=>{
          this.cdr.detectChanges();
        })
      }

    })
  }

  @ViewChild('fileInput') fileInput:any = undefined;
  profile_image: any = null
  handleFileInput(event: any) {
    let file = event.target.files[0];
    if(file){
      let reader = new FileReader()
      reader.onload = (e)=>{
        let base64 = reader.result as string
        this.profile_image = {
          name: file.name,
          type: file.type,
          base64: base64
        }
      }
      reader.readAsDataURL(file)
    }
  }

  async selectImage(){
    if(this.platform.is('capacitor')){
      let result:PickImagesResult;
      try{
        result = await FilePicker.pickImages({
          limit: 1,
          readData: true,
          skipTranscoding: false // This is to automatically convert HEIC to JPEG
        })
      }catch(e){
        return;
      }
      if (result['files'].length > 0) { // == 1
        let file = result["files"][0]
        let data = result.files[0].data
        data = "data:" + file.mimeType + ";base64," + data
        this.profile_image = {
          name: file.name,
          type: file.mimeType,
          base64: data 
        }
      }
    }else{
      this.fileInput.nativeElement.click()
    }
  }

  submit(){ // Doesn't work in iOS anymore since update
    this.formIsLoading = true
    let obj = this.form.value
    obj.id = this.user_id
    obj.profile_image = this.profile_image
    obj.phone = obj.phone_prefix + obj.phone
    this.contentService.put('/users', obj)
      .pipe(catchError(error=>{
        if(error.status == 422){
          this.manageValidationFeedback(error, 'password')
          this.manageValidationFeedback(error, 'password_confirm')
          this.manageValidationFeedback(error, 'firstname')
          this.manageValidationFeedback(error, 'lastname')
          this.manageValidationFeedback(error, 'phone')
          this.manageValidationFeedback(error, 'city')
          this.manageValidationFeedback(error, 'postal_code')
        }
        return throwError(error)
      }), finalize(()=>{
        this.formIsLoading = false
      }))
      .subscribe(async(res)=>{
        this.feedbackService.register("Les informations ont été mises à jour", 'success')
        await this.contentService.reloadUserData()
        this.form.reset()
        this.router.navigate(["/home"]);
      })
  }

  getStaticUrl(suffix:any){
    return this.contentService.rootEndpoint + '/' + suffix
  }

  async deleteAccount(){
    // Show modal
    let modal = await this.modalCtrl.create({
      component: PasswordConfirmationModalComponent,
      componentProps: {}
    })
    await modal.present()
    let {data, role} = await modal.onDidDismiss()
    if(role == 'confirm'){
      // Send DELETE method to the backend
      let user = await this.contentService.storage.get('user')
      let obj: any = {
        id: this.user_id,
        email: user.email,
        password: data
      }
      // Try to request login
      this.contentService.requestLogin(obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.feedbackService.registerNow("Le mot de passe est requis", 'danger')
          }
          if(error.status == 401){
            this.feedbackService.registerNow("Le mot de passe est incorrect", 'danger')
          }
          return throwError(error)
        }))
        .subscribe(async(res)=>{
          await this.contentService.storage.clear()
          let id_list = this.user_id.toString()
          await this.contentService.delete('/users', id_list)
            .subscribe(()=>{
              this.feedbackService.register("Le compte a été supprimé", 'success')
              this.router.navigate(["/login"]);
            })
          // this.router.navigate(["/login"]);
        })

      /*
      this.contentService.deleteOne('/users/self', obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.feedbackService.registerNow("Le mot de passe est incorrect", 'danger')
          }
          return throwError(error)
        }))
        .subscribe(async()=>{
          console.debug("Delete user account")
          this.feedbackService.register("Le compte a été supprimé", 'success')
          await this.contentService.storage.clear()
          this.router.navigate(["/login"]);
        })

       */
    }
  }

  navigate(url:string){
    this.router.navigate([url])
  }

  // 8. Sending verification Email
  sendVerificationEmail(){
    this.verificationEmailIsLoading = true
    this.contentService.getOne('/verifyEmail', {})
      .pipe(finalize(()=>{this.verificationEmailIsLoading = false}))
      .subscribe((res)=>{
        if(res){
          this.feedbackService.registerNow("Un email de vérification a été envoyé", 'success')
        }
      })
  }

  endSubscription(){
    this.contentService.post('/cancel-subscription', {})
      .subscribe((res)=>{
        if(res){
          console.log(res)
          this.feedbackService.register("Votre abonnement a été annulé", "success")
          this.router.navigate(['/home'])
        }
      })
  }

  presentManageModal(){
    if(this.platform.is('ios')){
      let res = StorePlugin.present({
        message: "Manage subscription"
      })
    }else if(this.platform.is('android')){
      from(StorePlugin.openAndroidSubscriptionManagementPage({productId: 'training_day'}))
        .pipe(catchError((e)=>{
          console.error(`Error while calling native code: ${JSON.stringify(e)}`)
          return throwError(()=>e)
        }))
    }else{
      this.feedbackService.registerNow("La gestion des abonnements n'est pas disponible sur cette plateforme", 'danger')
    }
  }

  protected readonly Object = Object; // Should be removed

  // The form for activity (can be updated independantly from the main form)
  activityStatusForm:FormGroup = new FormGroup({
    'activeFrom': new FormControl(''),
    'activeTo': new FormControl(''),
    'pauseDays': new FormControl(''),
  })
  activityStatusDisplayedError = {
    'activeFrom': undefined,
    'activeTo': undefined,
    'pauseDays': undefined
  }
  submitActivityStatusForm(){
    let formData = this.activityStatusForm.value
    // For each key in obj
    let observables = []
    for(let key in formData){
      let obj = {
        user_id: this.user_id,
        key: key,
        value: formData[key],
      }
      observables.push(this.contentService.put('/user-settings', obj)
        .pipe(catchError(error=>{
          if(error.status == 422){
            this.manageValidationFeedback(error, key, this.activityStatusForm)
          }
          return throwError(error)
        })))
    }
    // Run and merge all using forkJoin
    merge(...observables)
      .subscribe(async()=>{
        await this.contentService.reloadUserData()
        
        this.feedbackService.registerNow("Vos paramètres ont été mises à jour", 'success')
      })

    /*
    this.contentService.put('/settings/activityStatus', obj)
    .pipe(catchError(error=>{
      if(error.status == 422){
        this.manageValidationFeedback(error, 'activeFrom', this.activityStatusForm)
        this.manageValidationFeedback(error, 'activeTo', this.activityStatusForm)
        this.manageValidationFeedback(error, 'pauseDays', this.activityStatusForm)
      }
      return throwError(error)
    }))
    .subscribe(async(res)=>{
      this.feedbackService.registerNow("Vos paramètres ont été mises à jour", 'success')
    })*/
  }

  /*async cancelSubscription(){
    // Display an Alert to confirm the subscription ending
    (new Observable(observer => {
      this.alertCtrl.create({
        header: 'Confirmation',
        message: 'Voulez-vous mettre fin à votre abonnement ?',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
            handler: () => {
              observer.next(false);
              observer.complete();
            }
          },
          {
            text: 'Confirmer',
            handler: () => {
              observer.next(true);
              observer.complete();
            }
          }
        ]
      }).then((alert)=>{
        alert.present()
      })
    }))
      .pipe(
        filter((val)=>val === true),
        switchMap((val:boolean)=>{
          return from(StorePlugin.openAndroidSubscriptionManagementPage({productId: 'training_day'}))
            .pipe(catchError((e)=>{
              console.error(`Error while calling native code: ${JSON.stringify(e)}`)
              return throwError(()=>e)
            }))
        })
      )
      .subscribe((res)=>{
        console.log(`Response after opening: ${res}`)
      })
    
  }*/

  updateOnboardingInfo(url:string){
    this.router.navigateByUrl(`${url}?mode=edit`)
  }
}
