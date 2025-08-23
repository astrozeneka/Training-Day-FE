import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmAppointmentPage } from './confirm-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmAppointmentPageRoutingModule {}
