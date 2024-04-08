import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsPaymentPageRoutingModule } from './subscriptions-payment-routing.module';

import { SubscriptionsPaymentPage } from './subscriptions-payment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsPaymentPageRoutingModule
  ],
  declarations: [SubscriptionsPaymentPage]
})
export class SubscriptionsPaymentPageModule {}
