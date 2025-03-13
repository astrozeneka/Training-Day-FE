import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S4SleepPageRoutingModule } from './s4-sleep-routing.module';

import { S4SleepPage } from './s4-sleep.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S4SleepPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [S4SleepPage]
})
export class S4SleepPageModule {}
