import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.codecrane.training-day',
  appName: 'Training-Day',
  webDir: 'www',
// TODO: [CRITICAL] Comment this when providing builds and uncomment FOR enabling live-reload, uncomment this
  /*server: {
    // androidScheme: 'http',
    url: 'http://localhost:8100', 
    cleartext: true
  },*/
  android: {
    allowMixedContent: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    InAppPurchase2: {
    },
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: true 
    }
  },
  cleartext: true
};

export default config;
