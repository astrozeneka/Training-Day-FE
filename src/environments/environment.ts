// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

enum paymentMethod {
  stripe = 'stripe',
  inAppPurchase = 'inAppPurchase'
}

export const environment = {
  production: false,
  // apiEndpoint: 'http://192.168.1.187:8000/api',
  // rootEndpoint: 'http://192.168.1.187:8000',
  apiEndpoint: 'http://192.168.88.248:8000/api',
  rootEndpoint: 'http://192.168.88.248:8000',
  paymentServiceEnabled: true,
  paymentMethod: paymentMethod.inAppPurchase,

  // Pusher configuration
  pusher_app_key: 'app-key',
  // pusher_host: '192.168.1.187',
  pusher_host: '192.168.88.248',
  pusher_port: 6001,
  pusher_cluster: 'eu',

  // CREDENTIALS
  GITHUB_CLIENT_ID: "Ov23li5nl0PxQzCvyJKE",
  GITHUB_AUTH_REDIRECT_URI: ''
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
