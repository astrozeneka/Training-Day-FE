import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePaymentsViewPage } from './manage-payments-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManagePaymentsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagePaymentsViewPageRoutingModule {}
