import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IapAndSubscriptionsPage } from './iap-and-subscriptions.page';

const routes: Routes = [
  {
    path: '',
    component: IapAndSubscriptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IapAndSubscriptionsPageRoutingModule {}
