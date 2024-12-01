import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
/*import { Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element/bundle'; */
import { register } from 'swiper/element/bundle';


import { HomePageRoutingModule } from './home-routing.module';
import {MainMenuComponent} from "../../components/main-menu/main-menu.component";
import {UtilitiesModule} from "../../components/utilities.module";

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeFr);


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    UtilitiesModule,
  ],
  declarations: [HomePage],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {

  constructor(){
    register()
  }
}
