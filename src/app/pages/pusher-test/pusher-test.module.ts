import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PusherTestPageRoutingModule } from './pusher-test-routing.module';

import { PusherTestPage } from './pusher-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PusherTestPageRoutingModule
  ],
  declarations: [PusherTestPage]
})
export class PusherTestPageModule {}
