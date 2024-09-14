import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppWeightTrackingPage } from './app-weight-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: AppWeightTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppWeightTrackingPageRoutingModule {}
