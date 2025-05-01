import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessengerMasterPage } from './messenger-master.page';

const routes: Routes = [
  {
    path: '',
    component: MessengerMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessengerMasterPageRoutingModule {}
