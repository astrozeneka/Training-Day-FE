import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatDetailsPageRoutingModule } from './chat-details-routing.module';

import { ChatDetailsPage } from './chat-details.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatDetailsPageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule
  ],
  declarations: [ChatDetailsPage]
})
export class ChatDetailsPageModule {}
