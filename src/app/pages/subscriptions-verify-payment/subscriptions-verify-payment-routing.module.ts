import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionsVerifyPaymentPage } from './subscriptions-verify-payment.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsVerifyPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsVerifyPaymentPageRoutingModule {}
