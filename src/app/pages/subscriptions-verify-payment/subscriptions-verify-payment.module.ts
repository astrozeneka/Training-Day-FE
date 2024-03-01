import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsVerifyPaymentPageRoutingModule } from './subscriptions-verify-payment-routing.module';

import { SubscriptionsVerifyPaymentPage } from './subscriptions-verify-payment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsVerifyPaymentPageRoutingModule
  ],
  declarations: [SubscriptionsVerifyPaymentPage]
})
export class SubscriptionsVerifyPaymentPageModule {}
