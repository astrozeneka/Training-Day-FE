import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppTimerPageRoutingModule } from './app-timer-routing.module';

import { AppTimerPage } from './app-timer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppTimerPageRoutingModule
  ],
  declarations: [AppTimerPage]
})
export class AppTimerPageModule {}