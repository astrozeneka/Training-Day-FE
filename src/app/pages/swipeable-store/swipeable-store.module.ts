import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwipeableStorePageRoutingModule } from './swipeable-store-routing.module';

import { SwipeableStorePage } from './swipeable-store.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';
import { register } from 'swiper/element';

// For older of swiper
// import SwiperCore, { Navigation, Pagination } from 'swiper';
// import { SwiperModule } from 'swiper/angular';
// SwiperCore.use([Navigation, Pagination]);
// in swiper v11, it is used as a Web Component 
// Source: https://stackoverflow.com/questions/77868506/swiper-in-angular-17

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwipeableStorePageRoutingModule,
    UtilitiesModule
  ],
  declarations: [SwipeableStorePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StorePageModule {
  constructor(){
    register() // Might be unused
  }
}
