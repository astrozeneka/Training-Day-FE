import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseVerifyCompletePage } from './purchase-verify-complete.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseVerifyCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseVerifyCompletePageRoutingModule {}
