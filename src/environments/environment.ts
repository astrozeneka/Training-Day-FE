export const environment = {
  production: false,
  apiEndpoint: 'https://training-day-dev.codecrane.me/api',
  rootEndpoint: 'https://training-day-dev.codecrane.me',

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
  coachId: 18, // Change to 14 when in real production
  nutritionistId: 19,

  // CGU
  cgu_uri: '/docs/CGU-Training-Day.pdf',
  cgv_uri: '/docs/CGV-Training-Day.pdf',

  // Redeem code
  redeemCodeEnabled: true,

  // Cache prefix
  cachePrefix: 'trainingday_',

  // iOS promo code doesn't work (2024), waiting for next update: 
  // https://developer.apple.com/forums/thread/742113
  // https://www.reddit.com/r/iOSProgramming/comments/18cvp7t/cannot_redeem_code/?rdt=53265
  iosPromoCodeEnabled: false
};
