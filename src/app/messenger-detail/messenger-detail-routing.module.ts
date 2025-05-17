import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessengerDetailPage } from './messenger-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MessengerDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessengerDetailPageRoutingModule {}
