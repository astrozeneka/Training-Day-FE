import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatMasterV4PageRoutingModule } from './chat-master-v4-routing.module';
import { ChatMasterV4Page } from './chat-master-v4.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';
import { register } from 'swiper/element';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatMasterV4PageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ChatMasterV4Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatMasterV4PageModule {
  constructor(){
    register()
  }
}
