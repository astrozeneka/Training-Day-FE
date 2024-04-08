import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionsPaymentPage } from './subscriptions-payment.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsPaymentPageRoutingModule {}
