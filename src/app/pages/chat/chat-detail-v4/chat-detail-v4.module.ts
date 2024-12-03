import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatDetailV4PageRoutingModule } from './chat-detail-v4-routing.module';

import { ChatDetailV4Page } from './chat-detail-v4.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatDetailV4PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ChatDetailV4Page]
})
export class ChatDetailV4PageModule {}
