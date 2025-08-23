import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffAppointmentPage } from './staff-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: StaffAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffAppointmentPageRoutingModule {}
