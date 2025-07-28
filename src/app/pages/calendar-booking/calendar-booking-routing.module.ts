import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarBookingPage } from './calendar-booking.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarBookingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarBookingPageRoutingModule {}
