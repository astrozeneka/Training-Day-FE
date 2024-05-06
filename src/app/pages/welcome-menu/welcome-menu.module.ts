import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WelcomeMenuPageRoutingModule } from './welcome-menu-routing.module';

import { WelcomeMenuPage } from './welcome-menu.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WelcomeMenuPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [WelcomeMenuPage]
})
export class WelcomeMenuPageModule {}
