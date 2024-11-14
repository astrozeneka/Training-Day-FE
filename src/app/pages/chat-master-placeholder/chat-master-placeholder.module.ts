import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatMasterPlaceholderPageRoutingModule } from './chat-master-placeholder-routing.module';

import { ChatMasterPlaceholderPage } from './chat-master-placeholder.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatMasterPlaceholderPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ChatMasterPlaceholderPage]
})
export class ChatMasterPlaceholderPageModule {}
