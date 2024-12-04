import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatMasterV4PageRoutingModule } from './chat-master-v4-routing.module';

import { ChatMasterV4Page } from './chat-master-v4.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatMasterV4PageRoutingModule
  ],
  declarations: [ChatMasterV4Page]
})
export class ChatMasterV4PageModule {}
