import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppTimerPage } from './app-timer.page';

const routes: Routes = [
  {
    path: '',
    component: AppTimerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppTimerPageRoutingModule {}
