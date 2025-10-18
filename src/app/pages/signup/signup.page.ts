import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ContentService } from "../../content.service";
import { FeedbackService } from "../../feedback.service";
import { catchError, finalize, throwError } from "rxjs";
import { Router } from "@angular/router";
import {Storage} from "@ionic/storage-angular";
import { FormComponent } from "../../components/form.component";
import PasswordToggle from 'src/app/utils/PasswordToggle';
import { DarkModeService } from 'src/app/dark-mode.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { SignInWithAppleResponse } from 'src/app/components/continue-with-apple-button/continue-with-apple-button.component';
import { User } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-signup',
  template: `
<ion-header [translucent]="true">
</ion-header>

<ion-content class="ion-padding">

  <div [class]="'loading-placeholder ' + (formIsLoading ? '' : 'hidden')">
    <ion-spinner name="crescent"></ion-spinner>
  </div>

  <div class="centered-container">
    <div>
      <div class="signup-header">
        <h1>Créer un compte</h1>
        <div class="logo-container">
          <img src="assets/logo-light-cropped.png" alt="Training Day" width="120px" *ngIf="!useDarkMode">
          <img src="assets/logo-dark-cropped.png" alt="Training Day" width="120px" *ngIf="useDarkMode">
        </div>
      </div>

      <!-- Step 1: Email input -->
      <div *ngIf="currentStep === 1">
        <form [formGroup]="form" (submit)="validateEmail()">
          <ion-item class="ion-margin-vertical">
            <ion-input
              label="Email"
              label-placement="floating"
              formControlName="email"
              [errorText]="displayedError.email"
              autocomplete="email"
              appAutofill
            ></ion-input>
          </ion-item>

          <app-ux-button
            expand="full"
            type="submit"
            shape="round"
            [loading]="formIsLoading"
          >
            Continuer
          </app-ux-button>
        </form>

        <div class="divider-section">
          <hr/>
          <span class="divider-text">ou s'inscrire avec</span>
          <hr/>
        </div>

        <div class="social-buttons">
          <app-continue-with-google-button
            (action)="loginWithGoogle($event)"
            color="medium"
            expand="block"
            type="button"
            shape="round"
            fill="clear"
            size="small"
          ></app-continue-with-google-button>

          <app-continue-with-apple-button
            (action)="loginWithApple($event)"
            color="medium"
            expand="block"
            type="button"
            shape="round"
            fill="clear"
            size="small"
          ></app-continue-with-apple-button>
        </div>
      </div>

      <!-- Step 2: Firstname/Lastname -->
      <div *ngIf="currentStep === 2">
        <form [formGroup]="form" (submit)="validateNames()">
          <ion-item class="ion-margin-vertical">
            <ion-input
              label="Prénom"
              label-placement="floating"
              formControlName="firstname"
              [errorText]="displayedError.firstname"
            ></ion-input>
          </ion-item>

          <ion-item class="ion-margin-vertical">
            <ion-input
              label="Nom"
              label-placement="floating"
              formControlName="lastname"
              [errorText]="displayedError.lastname"
            ></ion-input>
          </ion-item>

          <app-ux-button
            expand="full"
            type="submit"
            shape="round"
            [loading]="formIsLoading"
          >
            Continuer
          </app-ux-button>
        </form>

        <ion-button
          expand="full"
          fill="clear"
          color="medium"
          (click)="goBack()"
        >
          Retour
        </ion-button>
      </div>

      <!-- Step 3: Password -->
      <div *ngIf="currentStep === 3">
        <form [formGroup]="form" (submit)="submitForm()">
          <ion-item class="ion-margin-vertical">
            <ion-input
              label="Mot de passe"
              label-placement="floating"
              formControlName="password"
              [type]="passwordToggle.value ? 'text' : 'password'"
              [errorText]="displayedError.password"
              autocomplete="new-password"
            ></ion-input>
            <ion-button
              color="medium"
              fill="clear"
              class="password-toggle"
              shape="round"
              (touchstart)="passwordToggle.toggle($event, true)"
              (touchend)="passwordToggle.toggle($event, false)"
              (mousedown)="passwordToggle.toggle($event, true)"
              (mouseup)="passwordToggle.toggle($event, false)"
            >
              <div>
                <ion-icon slot="end" name="eye"></ion-icon>
              </div>
            </ion-button>
          </ion-item>

          <ion-item class="ion-margin-vertical">
            <ion-input
              label="Confirmez le mot de passe"
              label-placement="floating"
              formControlName="password_confirm"
              [type]="passwordConfirmToggle.value ? 'text' : 'password'"
              [errorText]="displayedError.password_confirm"
              autocomplete="new-password"
            ></ion-input>
            <ion-button
              color="medium"
              fill="clear"
              class="password-toggle"
              shape="round"
              (touchstart)="passwordConfirmToggle.toggle($event, true)"
              (touchend)="passwordConfirmToggle.toggle($event, false)"
              (mousedown)="passwordConfirmToggle.toggle($event, true)"
              (mouseup)="passwordConfirmToggle.toggle($event, false)"
            >
              <div>
                <ion-icon slot="end" name="eye"></ion-icon>
              </div>
            </ion-button>
          </ion-item>

          <app-ux-button
            expand="full"
            type="submit"
            shape="round"
            [loading]="formIsLoading"
          >
            Créer le compte
          </app-ux-button>
        </form>

        <ion-button
          expand="full"
          fill="clear"
          color="medium"
          (click)="goBack()"
        >
          Retour
        </ion-button>
      </div>

      <!-- Step 4: Accept Conditions -->
      <div *ngIf="currentStep === 4">
        <div class="conditions-container">
          <h3>Conditions d'utilisation</h3>
          <p class="helper">Veuillez accepter nos conditions pour finaliser votre inscription</p>

          <div class="custom-checkbox-container" (click)="toggleConditions()">
            <div class="custom-checkbox" [class.checked]="form.get('acceptConditions')?.value">
              <ion-icon name="checkmark" *ngIf="form.get('acceptConditions')?.value"></ion-icon>
            </div>
            <div class="checkbox-text">
              J'accepte <a class="conditions-link" (click)="openCGU(); $event.stopPropagation()">les conditions générales d'utilisation</a>
            </div>
          </div>

          <div class="error-message" *ngIf="displayedError.acceptConditions">
            {{ displayedError.acceptConditions }}
          </div>
        </div>

        <ion-button
          expand="full"
          fill="outline"
          color="medium"
          shape="round"
          class="privacy-policy-button"
          (click)="openPrivacyPolicy()"
        >
          <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
          Politique d'engagement de confidentialité
        </ion-button>

        <app-ux-button
          expand="full"
          type="button"
          shape="round"
          [loading]="formIsLoading"
          (click)="submitForm()"
        >
          Créer le compte
        </app-ux-button>

        <ion-button
          expand="full"
          fill="clear"
          color="medium"
          (click)="goBack()"
        >
          Retour
        </ion-button>
      </div>

      <p class="ion-margin-top">
        <a routerLink="/login">Déjà un compte ? Se connecter</a>
      </p>
    </div>
  </div>
</ion-content>
`,
  styles: [`
@import '../../../mixins';
@import 'src/theme/mixins.scss';

.signup-header{
  padding-bottom: 1em;

  h1{
    @include display-1;
    margin-bottom: 0.5em;
  }

  .logo-container {
    margin-bottom: 1em;
  }
}

.centered-container{
  text-align: center;
  max-width: 600px;
  margin: auto;

  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  &>div{
    width: 100%;
  }
}

.password-toggle{
  @include password-toggle;
}

.divider-section {
  display: flex;
  align-items: center;
  gap: 1em;
  margin: 1.5em 0;

  hr {
    flex: 1;
    margin: 0;
  }

  .divider-text {
    color: var(--ion-color-medium);
    font-size: 0.85em;
    text-transform: uppercase;
  }
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5em;
  margin-bottom: 1em;
}

// ======== Step 3 (conditions) styles ========
.conditions-container {
  padding: 1rem 0;
  
  h3 {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .helper {
    color: var(--ion-color-medium);
    margin-bottom: 1.5rem;
  }
}

.custom-checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 1rem;
  border: 1px solid var(--ion-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover {
    border-color: var(--ion-color-primary);
    background-color: var(--ion-color-light);
  }
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ion-color-medium);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  
  &.checked {
    background-color: var(--ion-color-primary);
    border-color: var(--ion-color-primary);
    
    ion-icon {
      color: white;
      font-size: 14px;
    }
  }
}

.checkbox-text {
  flex: 1;
  line-height: 1.4;
  font-size: 0.9rem;
}

.conditions-link {
  color: var(--ion-color-primary);
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    text-decoration: none;
  }
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  padding: 0 1rem;
}

.privacy-policy-button {
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.loading-placeholder {
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900000;
  backdrop-filter: blur(10px);
  background-color: rgba(var(--ion-color-background-rgb), 0.2);
  opacity: 1;
  transition: opacity 0.3s;

  &.hidden{
    z-index: -1;
    opacity: 0;
  }
}
`]
})
export class SignupPage extends FormComponent implements OnInit {

  currentStep: number = 1;
  useDarkMode: boolean = false;
  formIsLoading: boolean = false;

  // Password toggles
  passwordToggle = new PasswordToggle();
  passwordConfirmToggle = new PasswordToggle();

  // Form for all steps - dynamically add validators based on current step
  override form = new FormGroup({
    'email': new FormControl(''),
    'firstname': new FormControl(''),
    'lastname': new FormControl(''),
    'password': new FormControl(''),
    'password_confirm': new FormControl(''),
    'acceptConditions': new FormControl(false)
  });

  override displayedError = {
    'email': undefined,
    'firstname': undefined,
    'lastname': undefined,
    'password': undefined,
    'password_confirm': undefined,
    'acceptConditions': undefined
  };

  constructor(
    private contentService: ContentService, // DO not use http provided by the content service
    private http: HttpClient,
    public storage: Storage,
    private feedbackService: FeedbackService,
    private router: Router,
    private dms: DarkModeService,
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) {
    super();
  }

  async ngOnInit() {
    this.useDarkMode = await this.dms.isAvailableAndEnabled();
    this.setValidatorsForCurrentStep();
  }

  setValidatorsForCurrentStep() {
    // Clear all errors
    this.clearDisplayedErrors();
    
    // Reset all validators
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.clearValidators();
    });

    // Set validators based on current step
    if (this.currentStep === 1) {
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
    } else if (this.currentStep === 2) {
      this.form.get('firstname')?.setValidators([Validators.required]);
      this.form.get('lastname')?.setValidators([Validators.required]);
    } else if (this.currentStep === 3) {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password_confirm')?.setValidators([Validators.required]);
    } else if (this.currentStep === 4) {
      this.form.get('acceptConditions')?.setValidators([Validators.requiredTrue]);
    }

    // Update form validity
    this.form.updateValueAndValidity();
  }

  clearDisplayedErrors() {
    Object.keys(this.displayedError).forEach(key => {
      this.displayedError[key] = undefined;
    });
  }

  async validateEmail() {
    console.log("Here");
    if (this.form.get('email')?.invalid) {
      this.form.get('email')?.markAsTouched();
      return;
    }

    this.formIsLoading = true;
    this.cdr.detectChanges();

    try {
      await this.checkEmailAvailability(this.form.value.email);
      this.currentStep = 2;
      this.setValidatorsForCurrentStep();
    } catch (error) {
      console.error('Email availability check failed:', error);
      this.feedbackService.registerNow(error, "danger");
    } finally {
      this.formIsLoading = false;
    }
  }

  validateNames() {
    const firstnameControl = this.form.get('firstname');
    const lastnameControl = this.form.get('lastname');

    if (firstnameControl?.invalid || lastnameControl?.invalid) {
      firstnameControl?.markAsTouched();
      lastnameControl?.markAsTouched();
      return;
    }

    this.currentStep = 3;
    this.setValidatorsForCurrentStep();
  }

  async submitForm() {
    if (this.currentStep == 3) {
      // On the password step, validate the password fields

      const passwordControl = this.form.get('password');
      const passwordConfirmControl = this.form.get('password_confirm');

      if (passwordControl?.invalid || passwordConfirmControl?.invalid) {
        passwordControl?.markAsTouched();
        passwordConfirmControl?.markAsTouched();
        return;
      }

      if (this.form.value.password !== this.form.value.password_confirm) {
        this.displayedError.password_confirm = 'Les mots de passe ne correspondent pas';
        return;
      }

      this.currentStep = 4;
      this.setValidatorsForCurrentStep();
      return;

    } else if (this.currentStep == 4) {

      // On the final step, validate the acceptance of conditions
      const acceptConditionsControl = this.form.get('acceptConditions');
      if (acceptConditionsControl?.invalid) {
        acceptConditionsControl?.markAsTouched();
        this.feedbackService.registerNow('Vous devez accepter les conditions générales d\'utilisation', 'danger');
        return;
      }
      
      const finalData = {
        email: this.form.value.email,
        firstname: this.form.value.firstname,
        lastname: this.form.value.lastname,
        password: this.form.value.password,
        password_confirm: this.form.value.password_confirm,
        acceptConditions: this.form.value.acceptConditions
      };

      this.formIsLoading = true;

      this.http.post(`${environment.apiEndpoint}/users`, finalData)
        .pipe(
          catchError((error) => {
            if (error.status == 422) {
              this.manageValidationFeedback(error, 'email');
              this.manageValidationFeedback(error, 'password');
              this.manageValidationFeedback(error, 'password_confirm');
              this.manageValidationFeedback(error, 'firstname');
              this.manageValidationFeedback(error, 'lastname');
            } else if (error.status == 0) {
              this.feedbackService.registerNow("Veuillez vérifier votre connexion internet", "danger");
            } else {
              this.feedbackService.registerNow("Erreur " + error.status, 'danger');
            }
            return throwError(error);
          }),
          finalize(() => {
            this.formIsLoading = false;
          })
        )
        .subscribe(async (res) => {
          this.form.reset();
          await this.feedbackService.registerNow("Inscription effectuée, vous pouvez désormais vous connecter");
          this.router.navigate(['/verify-mail']);
        })
      
    }

    /*this.formIsLoading = true;

    // Build the final data object matching the expected API format
    c;*/
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.setValidatorsForCurrentStep();
    }
  }

  // Fake API call to simulate email availability check
  private async checkEmailAvailability(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${environment.apiEndpoint}/users-check-email-availability`, {
        params: { email }
      })
      .pipe(
        catchError(err => {
          reject(err.message);
          return throwError(() => new Error('Email availability check failed'));
        })
      )
      .subscribe({
        next: (response) => {
          if (response['available']) {
            resolve();
          } else {
            reject("L'email est déjà utilisé");
          }
        },
        error: (error) => reject(error.message)
      });
    });
  }

    /*return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate email availability check - reject if email is 'test@example.com'
        if (email === 'test@example.com') {
          reject(new Error('Email already exists'));
        } else {
          resolve();
        }
      }, 1000);
    });*/

  // Google signup functionality reused from subscribe.page.ts
  loginWithGoogle({google_token}: {google_token: string}) {
    this.router.navigate(['/login'], {
      queryParams: {
        google_token: google_token
      }
    });
  }

  async loginWithApple(event: SignInWithAppleResponse) {
    this.formIsLoading = true;
    this.cdr.detectChanges();

    let deviceToken = await this.contentService.storage.get('device_token') ?? {'ios_token': 'fake'}
    this.http.post(`${environment.apiEndpoint}/request-login-with-apple`, {
      ...event,
      device_token: deviceToken
    })
    .pipe(
      catchError((error) => {
        if (error.status == 401) {
          this.feedbackService.registerNow("Connexion avec Apple échouée", "danger");
        } else if (error.status == 0) {
          this.feedbackService.registerNow("Veuillez vérifier votre connexion internet", "danger");
        } else {
          this.feedbackService.registerNow("Erreur " + error.status, 'danger');
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.formIsLoading = false;
      })
    )
    .subscribe(async (res: {token: string, refresh_token: string, user: User}) => {
      await this.storage.set('token', res.token)
      if (res.refresh_token)
        await this.storage.set('refresh_token', res.refresh_token);
      this.contentService.userStorageObservable.updateStorage(res.user);
      await this.storage.set('user', res.user);
      this.router.navigate(['/home']);
    })
  }

  openCGU() {
    const url = 'https://training-day-be.codecrane.me/doc-cgu';
    if (this.platform.is('capacitor')) {
      Browser.open({url: url});
    } else {
      window.open(url, '_blank');
    }
  }

  openPrivacyPolicy() {
    const url = 'https://training-day-be.codecrane.me/doc-privacy-policy';
    if (this.platform.is('capacitor')) {
      Browser.open({url: url});
    } else {
      window.open(url, '_blank');
    }
  }

  toggleConditions() {
    const currentValue = this.form.get('acceptConditions')?.value;
    this.form.get('acceptConditions')?.setValue(!currentValue);
    this.clearDisplayedErrors();
  }
}