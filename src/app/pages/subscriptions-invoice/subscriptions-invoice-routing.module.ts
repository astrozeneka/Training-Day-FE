import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionsInvoicePage } from './subscriptions-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsInvoicePageRoutingModule {}
