import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IapAndSubscriptionsPageRoutingModule } from './iap-and-subscriptions-routing.module';

import { IapAndSubscriptionsPage } from './iap-and-subscriptions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IapAndSubscriptionsPageRoutingModule
  ],
  declarations: [IapAndSubscriptionsPage]
})
export class IapAndSubscriptionsPageModule {}
