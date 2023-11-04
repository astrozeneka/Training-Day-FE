import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {MainMenuComponent} from "../../components/main-menu/main-menu.component";
import {UtilitiesModule} from "../../components/utilities.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    UtilitiesModule
  ],
    declarations: [HomePage],

})
export class HomePageModule {}
