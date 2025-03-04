import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AndroidPurchaseInvoicePage } from './android-purchase-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: AndroidPurchaseInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AndroidPurchaseInvoicePageRoutingModule {}
