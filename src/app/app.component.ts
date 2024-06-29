import {Component, NgZone, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "./content.service";
import {FeedbackService} from "./feedback.service";
import {ToastController} from "@ionic/angular";
import { PushNotifications } from '@capacitor/push-notifications';
import {HttpClient} from "@angular/common/http";
import StorePlugin from './custom-plugins/store.plugin'


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  user: any = null;
  device_token = {}
  push_notification_ready = false
  constructor(
    private router:Router,
    private zone: NgZone,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private toastController: ToastController,
    private httpClient: HttpClient
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

    /*
    // Register the device notification
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

    addListeners()
    registerNotifications()
    getDeliveredNotifications()

    */
  }

  private async onRouteChange(){
    this.contentService.reloadUserData()

    // Check if there is some message from the feedback service
    this.feedbackService.fetch().then((feedback)=>{
      if(feedback.message){
        let toast = this.toastController.create({
          message: feedback.message,
          position: 'bottom',
          duration: 5000,
          color: feedback.color
        })
        toast.then((toast)=>{
          toast.present()
        })
        this.feedbackService.clear()
      }
    })

    // We also update the user information from the database
    this.contentService.reloadUserData()

    // If the push notification listener is not yet configured, make them works
    if(this.user){ // TODO: optimize this algorithm
      console.log("Init notification listener")

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

      this.push_notification_ready = true
    }

  }

  async ngOnInit() {

    //console.log("Initializing store plugin...") // 不用了
    //await StorePlugin.initStore({});


    // Add some kind of listener
    /* (StorePlugin as any).addListener('productsLoaded', (info:any)=>{
      console.log("Products loaded")
      console.log(info)
      console.log("Intercepted Listener")
    }).then((response:any)=>{
      console.log("Listener added", response)
    })*/ // 不用了

    StorePlugin.getProducts({}).then((response:any)=>{
      console.log("Products loaded from getProducts", response)
    });



    //const {value} = await StorePlugin.echo({value: 'Hello from the store !'});
    //console.log("Requesting product list...")
    //const {value} = await StorePlugin.getProducts({})
    //console.log("Product list: ", value)
    //StorePlugin.initStore({})
  }
}
