import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseInvoicePage } from './purchase-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseInvoicePageRoutingModule {}
