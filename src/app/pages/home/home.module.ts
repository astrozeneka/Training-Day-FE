import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { Navigation, Pagination } from 'swiper/modules';
import { register } from 'swiper/element/bundle';


import { HomePageRoutingModule } from './home-routing.module';
import {MainMenuComponent} from "../../components/main-menu/main-menu.component";
import {UtilitiesModule} from "../../components/utilities.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    UtilitiesModule,
  ],
    declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {

  constructor(){
    register()
  }
}
