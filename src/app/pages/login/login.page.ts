import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Browser } from "@capacitor/browser";
import { v4 as uuidv4 } from 'uuid';
//import { PushNotifications } from '@capacitor/push-notifications';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import {ContentService} from "../../content.service";
import {catchError, finalize, throwError} from "rxjs";
import {FormComponent} from "../../components/form.component";
import {DEBUG, FeedbackService} from "../../feedback.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BroadcastingService} from "../../broadcasting.service";
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';
import PasswordToggle from 'src/app/utils/PasswordToggle';
import { DarkModeService } from 'src/app/dark-mode.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private fs: FeedbackService,
    private router: Router,
    private httpClient: HttpClient,
    private broadcastingService: BroadcastingService,
    private themeDetection: ThemeDetection,
    private dms: DarkModeService
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
    window.addEventListener('focus', async ev => {
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
    })

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
  }

  async requestLogin({email, password}){
    let deviceToken = await this.contentService.storage.get('device_token') ?? {'ios_token': 'fake'}
    console.log("Device token", deviceToken)
    this.contentService.requestLogin({
      'email': email,
      'password': password,
      'device_token':  deviceToken
    })
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
        await this.feedbackService.register("Bonjour, vous êtes connecté", 'success')
        // Update user data from the server
        this.router.navigate(['/home'])
      })
  }

  submit(){
    console.log("Submit")
    this.formIsLoading = true;
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
      Browser.open({url: authenticationAuthUrl})
    }
  }
}
