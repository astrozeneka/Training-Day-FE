import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessengerDetailPageRoutingModule } from './messenger-detail-routing.module';

import { MessengerDetailPage } from './messenger-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessengerDetailPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [MessengerDetailPage]
})
export class MessengerDetailPageModule {}
