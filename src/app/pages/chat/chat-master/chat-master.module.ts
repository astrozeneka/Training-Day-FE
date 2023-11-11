import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatMasterPageRoutingModule } from './chat-master-routing.module';

import { ChatMasterPage } from './chat-master.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatMasterPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ChatMasterPage]
})
export class ChatMasterPageModule {}
