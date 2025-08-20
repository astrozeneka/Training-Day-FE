import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarV2Page } from './calendar-v2.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarV2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarV2PageRoutingModule {}
