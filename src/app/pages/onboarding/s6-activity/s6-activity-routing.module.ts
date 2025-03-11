import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S6ActivityPage } from './s6-activity.page';

const routes: Routes = [
  {
    path: '',
    component: S6ActivityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S6ActivityPageRoutingModule {}
