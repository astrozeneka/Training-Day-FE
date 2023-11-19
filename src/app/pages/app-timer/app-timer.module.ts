import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppTimerPageRoutingModule } from './app-timer-routing.module';

import { AppTimerPage } from './app-timer.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppTimerPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [AppTimerPage]
})
export class AppTimerPageModule {}
