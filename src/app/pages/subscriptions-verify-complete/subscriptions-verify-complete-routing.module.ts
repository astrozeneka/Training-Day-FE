import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionsVerifyCompletePage } from './subscriptions-verify-complete.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsVerifyCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionsVerifyCompletePageRoutingModule {}
