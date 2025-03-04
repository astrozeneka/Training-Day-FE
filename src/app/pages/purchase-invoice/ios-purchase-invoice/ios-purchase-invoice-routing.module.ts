import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IosPurchaseInvoicePage } from './ios-purchase-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: IosPurchaseInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IosPurchaseInvoicePageRoutingModule {}
