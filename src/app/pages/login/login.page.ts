import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
//import { PushNotifications } from '@capacitor/push-notifications';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form = new FormGroup({
    "email": new FormControl('', [Validators.required, Validators.email]),
    "password": new FormControl('', Validators.required)
  })
  constructor(
  ) { }

  ngOnInit() {
    console.log(document.body.classList)

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

  }

  submit(){

  }

  getLogoSrc(){
    let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    if(darkMode)
      return "assets/logo-dark.png"
    else
      return "assets/logo-light.png"
  }



  protected readonly document = document;
}
