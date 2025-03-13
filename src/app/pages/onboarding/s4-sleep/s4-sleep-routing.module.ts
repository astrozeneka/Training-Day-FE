import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S4SleepPage } from './s4-sleep.page';

const routes: Routes = [
  {
    path: '',
    component: S4SleepPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S4SleepPageRoutingModule {}
