import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAppointmentsViewPage } from './manage-appointments-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAppointmentsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAppointmentsViewPageRoutingModule {}
