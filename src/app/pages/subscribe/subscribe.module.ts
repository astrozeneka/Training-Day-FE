import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscribePageRoutingModule } from './subscribe-routing.module';

import { SubscribePage } from './subscribe.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SubscribePageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [SubscribePage]
})
export class SubscribePageModule {}
