import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsVerifyCompletePageRoutingModule } from './subscriptions-verify-complete-routing.module';

import { SubscriptionsVerifyCompletePage } from './subscriptions-verify-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsVerifyCompletePageRoutingModule
  ],
  declarations: [SubscriptionsVerifyCompletePage]
})
export class SubscriptionsVerifyCompletePageModule {}
