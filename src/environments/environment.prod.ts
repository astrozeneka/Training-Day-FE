export const environment = {
  production: true,
  apiEndpoint: 'https://training-day-be.codecrane.me/api',
  rootEndpoint: 'https://training-day-be.codecrane.me',

  // Pusher configuration
  pusher_app_key: 'app-key',
  pusher_host: 'codecrane.me',
  pusher_port: 6001,
  pusher_cluster: 'eu',

  // CREDENTIALS
  GITHUB_CLIENT_ID: "Ov23li5nl0PxQzCvyJKE",
  GITHUB_AUTH_REDIRECT_URI: '',

  // FUNCTIONALITIES  
  paymentServiceEnabled: true,
  paymentMethod: 'inAppPurchase',
  personalTrainerAvailable: false             // Whether or not the personal trainer tab is available from the shop page
};
