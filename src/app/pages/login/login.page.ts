import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Browser } from "@capacitor/browser";
import { v4 as uuidv4 } from 'uuid';
//import { PushNotifications } from '@capacitor/push-notifications';
import { SavePassword } from 'capacitor-ios-autofill-save-password';
import StorePlugin from "../../custom-plugins/store.plugin";

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import {ContentService} from "../../content.service";
import {catchError, filter, finalize, Subject, take, throwError} from "rxjs";
import {FormComponent} from "../../components/form.component";
import {DEBUG, FeedbackService} from "../../feedback.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BroadcastingService} from "../../broadcasting.service";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';
import PasswordToggle from 'src/app/utils/PasswordToggle';
import { DarkModeService } from 'src/app/dark-mode.service';
import { OnboardingService } from 'src/app/onboarding.service';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-login',
  template: `
<ion-header [translucent]="true">
  <!--
  <ion-toolbar>
    <ion-title>login</ion-title>
  </ion-toolbar>
  -->
</ion-header>

<ion-content class="ion-padding">

  <div [class]="'loading-placeholder ' + (formIsLoading ? '' : 'hidden')">
    <ion-spinner name="crescent"></ion-spinner>
  </div>

  <!--
    <ion-header collapse="condense">
      <ion-toolbar>
        <ion-title size="large">login</ion-title>
      </ion-toolbar>
    </ion-header>
  -->
  <div class="centered-container">
    <div>
      <div class="login-header">
        <h1>Se connecter</h1>
        <div class="logo-container">
          <img src="assets/logo-light-cropped.png" alt="Training Day" width="120px" *ngIf="!useDarkMode">
          <img src="assets/logo-dark-cropped.png" alt="Training Day" width="120px" *ngIf="useDarkMode">
        </div>
      </div>
        <app-m-form [formGroup]="form" (submit)="submit()">
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

            <ion-item class="ion-margin-vertical">
                <ion-input
                  label="Password"
                  label-placement="floating"
                  formControlName="password"
                  [type]="passwordToggle.value ? 'text' : 'password'"
                  [errorText]="displayedError.password"
                  autocomplete="password"
                  appAutofill
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

            <app-ux-button
                    expand="full"
                    type="submit"
                    shape="round"
                    [loading]="formIsLoading"
            >
                Se connecter
            </app-ux-button>
        </app-m-form>

        <p class="forgot-password-link">
            <a routerLink="/forgot-password">Mot de passe oublié ?</a>
        </p>

      <div class="action-buttons">
        <div class="secondary-actions">
          <ion-button expand="block" color="medium" (click)="goTo('/signup')" shape="round" size="small">S'inscrire</ion-button>
          <ion-button expand="block" color="tertiary" (click)="goTo('/home')" shape="round" size="small">Sans compte</ion-button>
        </div>

        <div class="divider-section">
          <hr/>
          <span class="divider-text">ou se connecter avec</span>
          <hr/>
        </div>

        <div class="social-buttons">
          <app-continue-with-google-button
            (action)="requestLogin($event)"
            color="medium"
            expand="block"
            type="button"
            shape="round"
            fill="clear"
            size="small"
          ></app-continue-with-google-button>

          <app-continue-with-apple-button
            *ngIf="system == 'ios'"
            (action)="handleAppleSignIn($event)"
            color="medium"
            expand="block"
            type="button"
            shape="round"
            fill="clear"
            size="small"
          ></app-continue-with-apple-button>
        </div>

        <ion-button
          expand="full"
          fill="outline"
          color="medium"
          size="small"
          shape="round"
          class="privacy-policy-button"
          (click)="openPrivacyPolicy()"
        >
          <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
          Politique de confidentialité
        </ion-button>
      </div>

        <!--
        <app-ux-button
          (click)="continueWithGoogle()"
          color="medium"
          expand="full"
          type="button"
          shape="round"
          fill="clear"
        >
          <div class="inner">
            <img src="/assets/icon/social-menu/google-logo.svg" alt="Google" width="20px" height="20px">
            <div>Continuer avec Google</div>
          </div>
        </app-ux-button>-->

      <a *ngIf="false" routerLink="/s6-activity">Test select component</a>
        <div *ngIf="false">
            <h3 class="helper">Experimental features</h3>
            <ion-button (click)="continueWith('github')" color="medium">
                <!-- Used both registering or login -->
                Continue with Github
                <ion-icon  name="logo-github"></ion-icon>
            </ion-button>
            <ion-button (click)="continueWith('google')" color="medium">
                <!-- Used both registering or login -->
                Continue with Google
                <ion-icon  name="logo-google"></ion-icon>
            </ion-button>
            <ion-button (click)="continueWith('facebook')" color="medium">
                <!-- Used both registering or login -->
                Continue with Facebook
                <ion-icon  name="logo-facebook"></ion-icon>
            </ion-button><br/>


            <ion-button (click)="registerWithGithub()">
                Register with Github
            </ion-button>
            <ion-button (click)="exchangeGithubToken()">
                Exchange Github Token
            </ion-button>
        </div>

    </div>
  </div>
</ion-content>
`,
  styles: [`
@import '../../../mixins';
@import 'src/theme/mixins.scss';

.login-header{
  padding-bottom: 1em;

  h1{
    @include display-1;
    margin-bottom: 0.5em;
  }

  .logo-container {
    margin-bottom: 1em;
  }
}

.dark-logo img {
  display: none; /* Hide the light logo by default */
}

.dark-logo img:last-child {
  display: block; /* Display the dark logo when the dark mode is active */
}

ion-content{
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


// Password toggle
.password-toggle{
  @include password-toggle;
}

// The social authentication
app-ux-button .inner{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 7px;
}

.forgot-password-link {
  margin: 0.5em 0 1em 0;
  font-size: 0.9em;
}

.action-buttons {
  margin-top: 1em;

  .secondary-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5em;
    margin-bottom: 1em;
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
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    margin-bottom: 1.5em;
    & > *{
      flex: 1;
    }
  }

  .privacy-policy-button {
    margin-top: 8px;
    font-size: 0.85rem;
  }
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
`],
})
export class LoginPage extends FormComponent implements OnInit {

  override form = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', Validators.required)
  })
  formIsLoading = false;

  override displayedError = {
    'email': undefined,
    'password': undefined
  }

  device_token = {}

  // tooglable object for password display
  passwordToggle = new PasswordToggle()

  // Darkmode
  useDarkMode:boolean = false;

  // App link handling (for login only) - Subject is the token
  onOpenedFromGoogleOauth$: Subject<{token: string}> = new Subject()

  // The google login process differs whether the user is on iOS or Android
  system:'ios'|'android' = null

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private fs: FeedbackService,
    private router: Router,
    private httpClient: HttpClient,
    private broadcastingService: BroadcastingService,
    private themeDetection: ThemeDetection,
    private dms: DarkModeService,
    private os: OnboardingService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private route: ActivatedRoute
  ) {
    super()
  }

  async ngOnInit() {
    // Clear cache
    await this.contentService.storage.remove('tmp-user-info')

    // Check if the user is connected, then redirect it to the Home
    if(await this.contentService.storage.get('token') != undefined)
      this.router.navigate(['/home'])

    /*
    const addListeners = async () => {
      await PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value);
      });

      await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });
    }

    const registerNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
    }

    const getDeliveredNotifications = async () => {
      const notificationList = await PushNotifications.getDeliveredNotifications();
      console.log('delivered notifications', notificationList);
    }

    registerNotifications();
    */
    // Example
    /*
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
        console.log('Register permission')
      } else {
        console.log("Error, permission not granted")
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      // Push Notifications registered successfully.
      // Send token details to API to keep in DB.
      console.log("Listener, after registration")
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      // Handle push notification registration error here.
      console.log("Error when registering PushNotification")
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // Show the notification payload if the app is open on the device.
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // Implement the needed action to take when user tap on a notification.
      }
    );

     */

    // This will handle some passwordless login (when the user came back to the page)
    /*window.addEventListener('focus', async ev => {
      console.log("The user is back")
      let tmpUserInfo = await this.contentService.storage.get('tmp-user-info')
      if(tmpUserInfo && tmpUserInfo['next-step'] == 'prompt-user-info'){
        this.router.navigate(['/subscribe'])
      }else if(tmpUserInfo && tmpUserInfo['next-step'] == 'request-token'){
        let tmpUser = tmpUserInfo['user'];
        this.requestLogin({
          'email': tmpUser['email'],
          'password': tmpUser['password']
        })
      }
    })*/

    /*this.feedbackService.registerNow(
      null,
      'success',
      null,
      {
        type: 'modal',
        modalTitle: 'Votre achat a été effectué',
        modalContent: 'Votre coach prendra rendez-vous avec vous dans les prochaines 24h afin de programmer et ' +
          'planifier vos attentes en fonction de vos attentes.',
        modalImage: 'assets/logo-dark.png',
        buttonText: 'Prendre contact avec mon nutritionniste'
      }
    )*/

    // Checking if the darkmode is enabled
    this.useDarkMode = await this.dms.isAvailableAndEnabled()

    // 6. Handle deeplink redirection
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      /*this.feedbackService.registerNow("Deep link received : " + event.url, "secondary")*/
      console.log('App opened with URL: ' + event.url);
      if (event.url.includes('/app/google')){
        let token = event.url.split('/').pop()
        this.onOpenedFromGoogleOauth$.next({token: token})
      }
    })

    // 7. Detect the platform
    if (this.platform.is('android')){
      this.system = 'android'
    } else {
      this.system = 'ios'
    }

    // 8. Check whether a google_token is passed through the URL
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd && this.router.url.includes('login')))
      .subscribe((event: NavigationEnd) => {
        let googleToken = (this.route.snapshot.queryParamMap.get("google_token") || null) as string
        if (googleToken){
          // this.fs.registerNow("Google token provided", "secondary")
          // console.log("Google token provided")
          this.requestLogin({
            'google_token': googleToken
          })
        } else {
          // console.log("Google token not provided")
        }
      })
  }

  async requestLogin({email = null, password = null, google_token = null}){
    let deviceToken = await this.contentService.storage.get('device_token') ?? {'ios_token': 'fake'}
    // console.log("Device token", deviceToken)

    let params = {'device_token': deviceToken}
    if (google_token){
      params['google_token'] = google_token
    }else{
      params['email'] = email
      params['password'] = password
    }

    this.formIsLoading = true;
    this.cdr.detectChanges()

    this.contentService.requestLogin(params)
      .pipe(catchError((error)=>{
        if(error.status == 422){
          this.manageValidationFeedback(error, 'email');
          this.manageValidationFeedback(error, 'password');
        }else if(error.status == 401){ // 401 Unauthorized
          this.feedbackService.registerNow("Le nom d'utilisateur ou le mot de passe est incorrect", 'danger')
        }else if(error.status == 0){
          this.feedbackService.registerNow("Veuillez vérifier votre connexion internet", "danger")
        }else{
          this.feedbackService.registerNow("Erreur " + error.status, 'danger')
          console.log("Error: " + error.toString())
        }
        // this.fs.registerNow("Error :" + error.message, "danger", DEBUG)
        return throwError(error)
      }), finalize(()=>{
        this.formIsLoading = false;
      }))
      .subscribe(async (response: any) => {
        this.form.reset()
        try{
          await this.reloadPushNotificationPermissions()
        }catch (e){
          console.error('Device not compatible with PushNotification', e)
        }

        // IF the extra_data is already set, then redirect to the home page, otherwise, let him fill the form
        let user = await this.contentService.storage.get('user')
        if (!user.extra_data && user.function == 'customer'){
          this.os.clearOnboardingData()
          this.router.navigate(['/s2-more-info'])
        } else {
          await this.feedbackService.register("Bonjour, vous êtes connecté", 'success')
          this.router.navigate(['/home'])
        }
      })
    
  }

  submit(){
    console.log("Submit")
    this.requestLogin(this.form.value as any)
  }

  async reloadPushNotificationPermissions(){
    /*
    const addListeners = async () => {
      await PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value);
        this.device_token = {
          'ios_token': token.value
        }
        this.contentService.storage.get('token').then((token)=>{
          let headers = {}
          if(token)
            headers = {
              'Authorization': `Bearer ${token}`
            }
          const options = {
            headers: headers
          }
          this.httpClient.post(`${this.contentService.apiEndpoint}/notifications/register-device`, this.device_token, options).subscribe((response:any)=>{
            console.log('Device registered', response)
          })
        })
      });
      await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });
      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
      });
      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        let deepLink = notification.notification.data.deep_link
        console.log('Deep link', deepLink) // TODO: Solve
        this.feedbackService.register("Deep link received : " + deepLink + " / " + JSON.stringify(notification.notification.data), "secondary")
        if(deepLink)
          this.router.navigate([deepLink])
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });
    }

    const registerNotifications = async () => {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }
      await PushNotifications.register();
    }

    const getDeliveredNotifications = async () => {
      const notificationList = await PushNotifications.getDeliveredNotifications();
      console.log('delivered notifications', notificationList);
    }

    await addListeners()
    await registerNotifications()
    await getDeliveredNotifications()
    */
  }



  getLogoSrc(){
    let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    if(darkMode)
      return "assets/logo-dark.png"
    else
      return "assets/logo-light.png"
  }

  goTo(url: string){
    this.router.navigate([url])
  }

  protected readonly document = document;

  // TODO here, use the server broadcasting to update the UI when the server get a response + Universal URL
  registerWithGithub(){
    let GITHUB_CLIENT_ID = environment.GITHUB_CLIENT_ID
    const authenticationAuthUrl = `http://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`
    Browser.open({url: authenticationAuthUrl})
  }

  exchangeGithubToken(){
    let code = "38df53072bf0b8270d6e" // hardcoded to test our flow
    this.httpClient.post(`${environment.apiEndpoint}/github/register`, {code: code}).subscribe((response:any)=>{
      console.log(response)
    })
  }

  continueWith(provider:string){
    // Provider: google, github or facebook
    let provider_client_id = environment[`${provider.toUpperCase()}_CLIENT_ID`]
    const uniqueSessionId = uuidv4();
    if(provider == 'github'){
      const authenticationAuthUrl = `http://github.com/login/oauth/authorize?client_id=${provider_client_id}&scope=user&state=${uniqueSessionId}`
      // Listen to the corresponding socket
      console.log("Channel name " + `github.${uniqueSessionId}`)
      this.broadcastingService.pusher.subscribe(`github.${uniqueSessionId}`)
        .bind('updated', async (res)=>{
          // If the user is not registered the server will ask for additionnal information
          console.log(res)
          if(['prompt-user-info', 'request-token'].includes(res['next-step'])){
            console.log("Store tmp-user-info to local storage")
            await this.contentService.storage.set('tmp-user-info', res)
          }
          console.log(res)
        })
      //Browser.open({url: authenticationAuthUrl})
      // Redirect the webview (without)
    }else if(provider == 'google'){

    }
  }

  continueWithGoogle(){

    // Option 1: using a form and safari data (suitable for ios, android ??)
    const form = document.createElement('form');
    form.action = `${environment.rootEndpoint}/oauth/google`;
    form.method = 'GET';
    // add os = this.os parameter to the form
    form.innerHTML = `<input type="hidden" name="os" value="${this.system}">`
    document.body.appendChild(form);
    form.submit();
    

    // Option 2: using the browser (the browser doesn' allow the suer to access history)
    // Browser.open({url: `${environment.rootEndpoint}/oauth/google`})

    // Option 3: using Safari view
    /*StorePlugin.openSafariView({url: `${environment.rootEndpoint}/oauth/google`})*/

    this.onOpenedFromGoogleOauth$
      .pipe(take(1))
      .subscribe((res)=>{
        console.log("Token received :" + JSON.stringify(res))
        console.log("Request Login")
        this.requestLogin({
          'google_token': res.token
        })
    })
  }

  testSafariView(){
    StorePlugin.openSafariView({url: 'https://www.google.com'})
  }

  testPasswordAutofill() {
    console.log("Prompting dialog")
    SavePassword.promptDialog({
      username: 'test',
      password: 'test'
    })
      .then((result) => {
        console.log('SavePassword.promptDialog' + JSON.stringify(result));
      })
      .catch((error) => {
        console.error('SavePassword.promptDialog' + JSON.stringify(error));
      });
  }

  async handleAppleSignIn(appleResponse: any){
    this.formIsLoading = true;
    this.cdr.detectChanges();

    let deviceToken = await this.contentService.storage.get('device_token') ?? {'ios_token': 'fake'}

    this.httpClient.post(`${environment.apiEndpoint}/request-login-with-apple`, {
      ...appleResponse,
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
    .subscribe(async (res: any) => {
      await this.contentService.storage.set('token', res.token)
      if (res.refresh_token)
        await this.contentService.storage.set('refresh_token', res.refresh_token);
      this.contentService.userStorageObservable.updateStorage(res.user);
      await this.contentService.storage.set('user', res.user);

      try{
        await this.reloadPushNotificationPermissions()
      }catch (e){
        console.error('Device not compatible with PushNotification', e)
      }

      let user = await this.contentService.storage.get('user')
      if (!user.extra_data && user.function == 'customer'){
        this.os.clearOnboardingData()
        this.router.navigate(['/s2-more-info'])
      } else {
        await this.feedbackService.register("Bonjour, vous êtes connecté", 'success')
        this.router.navigate(['/home'])
      }
    })
  }

  openPrivacyPolicy() {
    const url = 'https://training-day-be.codecrane.me/doc-privacy-policy';
    if (this.platform.is('capacitor')) {
      Browser.open({url: url});
    } else {
      window.open(url, '_blank');
    }
  }
}
