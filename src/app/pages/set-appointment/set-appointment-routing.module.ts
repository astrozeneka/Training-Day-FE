import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetAppointmentPage } from './set-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: SetAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetAppointmentPageRoutingModule {}
