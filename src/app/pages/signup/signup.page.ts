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
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss']
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


  // The social buttons are displayed conditionally based on the platform
  system:'ios'|'android' = null

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


    // 7. Detect the platform
    if (this.platform.is('android')){
      this.system = 'android'
    } else {
      this.system = 'ios'
    }
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