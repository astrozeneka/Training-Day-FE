import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchasePaymentPage } from './purchase-payment.page';

const routes: Routes = [
  {
    path: '',
    component: PurchasePaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasePaymentPageRoutingModule {}
