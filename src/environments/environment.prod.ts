export const environment = {
  production: true,
  apiEndpoint: 'https://training-day-be.codecrane.me/api',
  rootEndpoint: 'https://training-day-be.codecrane.me',

  // Pusher configuration
  pusher_app_key: 'app-key',
  pusher_host: 'soketi.codecrane.me',
  pusher_port: 443,
  pusher_cluster: 'eu',

  // CREDENTIALS
  GITHUB_CLIENT_ID: "Ov23li5nl0PxQzCvyJKE",
  GITHUB_AUTH_REDIRECT_URI: '',

  // FUNCTIONALITIES  
  paymentServiceEnabled: true,
  paymentMethod: 'inAppPurchase',
  personalTrainerAvailable: false,             // Whether or not the personal trainer tab is available from the shop page

  // SPECIAL VARIABLES
  nutritionistId: 19,

  // CGU
  cgu_uri: '/docs/CGU-Training-Day.pdf',
  cgv_uri: '/docs/CGV-Training-Day.pdf',

  // Redeem code
  redeemCodeEnabled: true
};
