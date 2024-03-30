import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseDetailsPage } from './purchase-details.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseDetailsPageRoutingModule {}
