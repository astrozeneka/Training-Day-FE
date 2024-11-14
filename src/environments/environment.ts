// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ro } from "date-fns/locale";

enum paymentMethod {
  stripe = 'stripe',
  inAppPurchase = 'inAppPurchase'
}

export const environment = {
  production: false,
  // apiEndpoint: 'http://192.168.1.187:8000/api',
  // rootEndpoint: 'http://192.168.1.187:8000',
  // apiEndpoint: 'http://192.168.88.188:8000/api',
  // rootEndpoint: 'http://192.168.88.188:8000',
  apiEndpoint: 'http://192.168.1.231:8000/api',
  rootEndpoint: 'http://192.168.1.231:8000',

  // Pusher configuration
  pusher_app_key: 'app-key',
  // pusher_host: '192.168.1.187',
  // pusher_host: '192.168.88.188',
  pusher_host : '192.168.1.231',
  pusher_port: 6001,
  pusher_cluster: 'eu',

  // CREDENTIALS
  GITHUB_CLIENT_ID: "Ov23li5nl0PxQzCvyJKE",
  GITHUB_AUTH_REDIRECT_URI: '',

  // FUNCTIONALITIES  
  paymentServiceEnabled: true,                // Deprecated
  paymentMethod: paymentMethod.inAppPurchase, // Deprecated, only inAppPurchase is maintained for the app
  personalTrainerAvailable: false,            // Whether or not the personal trainer tab is available from the shop page

  // SPECIAL VARIABLES
  nutritionistId: 15,

  // CGU
  cgu_uri: '/docs/CGU-Training-Day.pdf',
  cgv_uri: '/docs/CGV-Training-Day.pdf',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
