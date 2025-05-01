import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessengerMasterPageRoutingModule } from './messenger-master-routing.module';

import { MessengerMasterPage } from './messenger-master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessengerMasterPageRoutingModule
  ],
  declarations: [MessengerMasterPage]
})
export class MessengerMasterPageModule {}
