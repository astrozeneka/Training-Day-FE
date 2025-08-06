import {Component, NgZone, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "./content.service";
import {FeedbackService, INFO} from "./feedback.service";
import {AlertController, IonicSafeString, Platform, ToastController} from "@ionic/angular";
import { PushNotifications } from '@capacitor/push-notifications';
import {HttpClient} from "@angular/common/http";
import StorePlugin, { AndroidEntitlement } from "./custom-plugins/store.plugin";
import {environment} from "../environments/environment";
import { catchError, throwError } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PurchaseService } from './purchase.service';
import { set } from 'date-fns';
import { BottomNavbarUtilsService } from './bottom-navbar-utils.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  user: any = null;
  device_token = {}
  push_notification_ready = false
  constructor(
    private router:Router,
    private zone: NgZone,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private toastController: ToastController,
    private httpClient: HttpClient,
    private platform: Platform,
    private alertController: AlertController, // For later, it can be used inside a separate service
    private sanitize: DomSanitizer,
    public purchaseService: PurchaseService,
    public bnus:BottomNavbarUtilsService,
    private cs: ContentService
  ) {

    router.events.subscribe((event)=>{
      if (event instanceof NavigationEnd) {
        this.zone.run(() => {
          // Execute your callback function here
          this.onRouteChange();
        });
      }
      // Old code is below
      this.contentService.storage.get('user')
        .then((u)=>{
          this.user = u;
        })
    })
  }

  async ngOnInit() {
    let token = await this.contentService.storage.get('token'); // Wait for the user to be loaded first
    (this.contentService as any)._token = token // By-passing the private variable

    if(this.platform.is('capacitor')){
      this.initializePushNotifications()
    } else{
      console.warn("Push notification is not available")
    }

    

    // IN-APP-PURCHASE ENTITLEMENTS MANAGEMENT
    // Loading and synchronizing entitlements
    // The code logic below will be removed in new version
    // Subscription/Purchaes management is handled by the back-end server only
    await new Promise((resolve)=>setTimeout(resolve, 1000)) // Wait for the user to be loaded first
    let fromDeviceData:{entitlements: any, subscriptions?: any}
    if (this.platform.is('capacitor')){
      if (this.platform.is('ios'))
        fromDeviceData = (await StorePlugin.getAutoRenewableEntitlements({}))
      else if (this.platform.is('android')){
        let androidData = (await this.purchaseService.getAndroidEntitlements('inapp')) as any as {entitlements: AndroidEntitlement[]}
        let list = androidData.entitlements.map(e=>e.products.join('+')).join(", ")
        fromDeviceData = {entitlements: androidData.entitlements}
        // TO DELETE LATER
        // this.feedbackService.registerNow("Android Entitlements[L] : " + list, "secondary")
      }
    } else {
      console.warn("IAP is not available in web platform")
    }
    // Test
    console.log("inputData : " +JSON.stringify({
      ...fromDeviceData,
      platform: this.platform.is('ios') ? 'ios' : 'android'
    }) )
    this.contentService.post('/users/sync-entitlements', {
      ...fromDeviceData,
      platform: this.platform.is('ios') ? 'ios' : 'android'
    })
      .pipe(catchError((error) => {
        //console.error("Error while synching device entitlements", JSON.stringify(error))
        if (!environment.production && false)
          this.feedbackService.registerNow("Error while syncing device entitlements :" + error, "danger")
        return throwError(error)
      }))
      .subscribe((response: any) => {
        console.log("Device entitlements verified from the server : "+ JSON.stringify(response))
        if (!environment.production)
          this.feedbackService.registerNow("Device entitlements verified from the server", "success")
      })

    /*
    // Store
    if(this.platform.is('ios')){
      // The auto-renewable subscriptions are manage by the entitlements from the device
      /*let data = (await StorePlugin.getNonRenewableEntitlements({}))
      let entitlements = data.entitlements
      let subscriptions = data.subscriptions */
      /*
      // Load the autoRenewableEntitlements
      if(this.platform.is('ios')) {
        //this.feedbackService.registerNow("Syncing device entitlements")
        let renewableData = (await StorePlugin.getAutoRenewableEntitlements({}))
        let renewableEntitlements = renewableData.entitlements
        let renewableSubscriptions = renewableData.subscriptions
        console.log("appComponent: autorenewable Entitlements", renewableEntitlements)
        console.log("appComponent: autorenewable Subscriptions", renewableSubscriptions)
        this.contentService.post('/users/sync-entitlements', {subscriptions: renewableSubscriptions, entitlements: renewableEntitlements})
          .pipe(catchError((error) => {
            this.feedbackService.registerNow("Error while syncing device entitlements :" + 
              JSON.stringify(error)
              , "danger")
            return throwError(error)
          }))
          .subscribe((response: any) => {
            this.feedbackService.registerNow("Device entitlements verified from the server", "success")
          if (response.success) {
            console.info("Device entitlements verified from the server")
          } else {
            this.feedbackService.registerNow(response.error, "danger") // Still have a bug
          }
        })
      }
    } else if(this.platform.is('cordova') && this.platform.is('android')){
      // TODO, the platform management shouldn't be here
      console.log("Loading entitlements from the server")
      let res = (await this.purchaseService.getAndroidEntitlements())
      console.log("Load entitlements from Google " + JSON.stringify(res))
      console.log(res)
      this.contentService.post('/users/sync-entitlements', {entitlements: res.entitlements})
        .pipe(catchError((error) => {
          this.feedbackService.registerNow("Error while syncing device entitlements :" + 
            JSON.stringify(error)
            , "danger")
          return throwError(error)
        }))
        .subscribe((response: any) => {
          this.feedbackService.registerNow("Device entitlements verified from the server", "success")
        })
    }
    */

    // Check token if expired or not, otherwise disconnect the user
    this.contentService.userStorageObservable.getStorageObservable().subscribe((user)=>{
      if(user){
        this.contentService.getOne(`/users/${user.id}`, {})
          .pipe(catchError((error) => {
            if(error){
              this.feedbackService.register("Votre session a expiré, veuillez vous reconnecter", "danger")
              this.contentService.logout()
            }
            return throwError(error)
          }))
          .subscribe((response)=>{
            this.user = response
          })
      }
    });

    // Check if the user have appointment, then show him an alert
    this.contentService.storage.get('no_more_alert').then((expirationDate)=>{
      if (expirationDate){
        let now = new Date()
        if(now < expirationDate){
          return
        }
      }

      this.contentService.userStorageObservable.getStorageObservable().subscribe(async (user)=>{
        if (user?.appointments?.length > 0){
          let formatedDate = new Date(user.appointments[0].datetime).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'})
          let formatedTime = new Date(user.appointments[0].datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
          let html = new IonicSafeString(`Vous avez un rendez-vous à venir le <b>${formatedDate}</b> à <b>${formatedTime}</b>`)
          let alert = await this.alertController.create({
            header: 'Rappel',
            message: html,
            buttons: [
              {
                text: "Ne plus m'avertir",
                role: "never_again"
              },
              {
                text: 'OK',
                role: 'ok'
              }
            ],
            cssClass: 'custom-alert'
          })
          console.log(html)
          await alert.present()
          // Manage the button clicked
          let result = await alert.onDidDismiss()
          if(result.role == "never_again"){ // No more alert for 1 hour
            let expirationDate = new Date()
            // expirationDate.setHours(expirationDate.getHours() + 1)
            expirationDate.setDate(expirationDate.getDate() + 7)
            this.contentService.storage.set('no_more_alert', expirationDate)
          }
          console.log(result)
        }
      })
    })

    // Validate token, then disconnect if expired (might be unused)
    // Only validate if the user is not on signup
    if (!this.router.url.includes('/signup') && !this.router.url.includes('/login')) {
      this.cs.post('/users/is-token-valid', {})
        .pipe(catchError((err)=>{
          // If error 401 or 403
          if(err.status == 401 || err.status == 403){
            this.cs.logout()
          }
          return throwError(err)
        }))
        .subscribe(()=>{})
    }
    
    // Refresh the token
    this.cs.refreshToken().subscribe(()=>{})
  }

  private async onRouteChange(){
    //this.contentService.reloadUserData()

    // Check if there is some message from the feedback service
    this.feedbackService.fetch().then((feedback)=>{
      if(feedback.message || feedback.options?.type == 'modal'){
        this.feedbackService.displayFeedback(feedback.message, feedback.color, INFO, feedback.options)
        this.feedbackService.clear()
      }
    })

    // We also update the user information from the database
    this.contentService.reloadUserData()

    // If the push notification listener is not yet configured, make them works
    /*if(this.user){
      this.preparePushNotifications()
    }*/

  }

  async initializePushNotifications(){
    console.log("AppComponent: Initializing push notifications")
    // For the push notification
    const addListeners = async () => {
      await PushNotifications.addListener('registration', token => {
        console.info('Registration token: ', token.value);
        this.device_token = {
          ... (this.platform.is('ios') ? {'ios_token': token.value} : {}),
          ... (this.platform.is('android') ? {'android_token': token.value} : {})
        }
        this.contentService.storage.set('device_token', this.device_token)
        // The code below is unused anymore because the device-token is registered to the server at login time
        /*this.contentService.storage.get('token').then((token)=>{
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
        })*/
      });
      await PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });
      await PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
      });
      await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        let deepLink = notification.notification.data.deep_link
        console.log('Deep link', deepLink) // It already works
        // this.feedbackService.register("Deep link received : " + deepLink + " / " + JSON.stringify(notification.notification.data), "secondary")
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
        this.feedbackService.registerNow("You need to allow the notifications to receive push notifications", "danger") // TODO: not yet tested
      }
      await PushNotifications.register();
    }
    const getDeliveredNotifications = async () => {
      const notificationList = await PushNotifications.getDeliveredNotifications();
      console.log('delivered notifications', notificationList);
    }

    if (this.platform.is('ios') || this.platform.is('android')) {
      await addListeners()
      await registerNotifications()
      await getDeliveredNotifications()

      this.push_notification_ready = true

    }else{
      // For the web, we will registerNotification for testing
      await registerNotifications()
      //console.warn("Push notifications are not available on web platform")
    }
  }
}
