import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PusherTestPage } from './pusher-test.page';

const routes: Routes = [
  {
    path: '',
    component: PusherTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PusherTestPageRoutingModule {}
