import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionsDurationPage } from './subscriptions-duration.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsDurationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsDurationPageRoutingModule {}
