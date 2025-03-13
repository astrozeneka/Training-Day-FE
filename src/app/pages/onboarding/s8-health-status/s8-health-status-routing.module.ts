import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S8HealthStatusPage } from './s8-health-status.page';

const routes: Routes = [
  {
    path: '',
    component: S8HealthStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S8HealthStatusPageRoutingModule {}
