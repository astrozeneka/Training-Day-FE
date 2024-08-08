import {Component, NgZone, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "./content.service";
import {FeedbackService, INFO} from "./feedback.service";
import {Platform, ToastController} from "@ionic/angular";
import { PushNotifications } from '@capacitor/push-notifications';
import {HttpClient} from "@angular/common/http";
import StorePlugin from "./custom-plugins/store.plugin";
import {environment} from "../environments/environment";


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
    private platform: Platform
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

    if(this.platform.is('ios') || this.platform.is('android'))
      this.initializePushNotifications()

    // Store
    if(this.platform.is('ios') || (!environment.production)){
      // The auto-renewable subscriptions are manage by the entitlements from the device
      /*let data = (await StorePlugin.getNonRenewableEntitlements({}))
      let entitlements = data.entitlements
      let subscriptions = data.subscriptions */



      // Load the autoRenewableEntitlements
      if(this.platform.is('ios')) {
        let renewableData = (await StorePlugin.getAutoRenewableEntitlements({}))
        let renewableEntitlements = renewableData.entitlements
        let renewableSubscriptions = renewableData.subscriptions
        console.log("appComponent: autorenewable Entitlements", renewableEntitlements)
        console.log("appComponent: autorenewable Subscriptions", renewableSubscriptions)
        this.contentService.post('/users/sync-device-entitlements', {subscriptions: renewableSubscriptions}).subscribe((response: any) => {
          if (response.success) {
            console.info("Device entitlements verified from the server")
          } else {
            this.feedbackService.registerNow(response.error, "danger") // Still have a bug
          }
        })
      }

      // Unused, The verification and purchase registration is done at transaction for non-renewable
      /*console.log("appComponent: Entitlements", entitlements)
      let data = {
        entitlements: entitlements
      }
      this.contentService.post('/payments/synchronize-entitlements', data).subscribe((response:any)=>{
        console.log(response)
        if(response.success){
          console.info("Device entitlements verified from the server")
        }else{
          this.feedbackService.registerNow(response.error, "danger") // Still have a bug
        }
      })
       */
    }
  }

  private async onRouteChange(){
    this.contentService.reloadUserData()

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
          'ios_token': token.value
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

    if (this.platform.is('ios') || this.platform.is('android')) {
      await addListeners()
      await registerNotifications()
      await getDeliveredNotifications()

      this.push_notification_ready = true

    }else{
      // For the web, we will registerNotification for testing
      await registerNotifications()
      //console.warn("Push notifications are not available on web platform")
      //this.feedbackService.registerNow("Push notifications are not available on web platform", "warning")

    }
  }
}
