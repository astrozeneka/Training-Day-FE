import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchaseDurationPage } from './purchase-duration.page';

const routes: Routes = [
  {
    path: '',
    component: PurchaseDurationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseDurationPageRoutingModule {}
