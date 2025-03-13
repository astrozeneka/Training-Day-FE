import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S7DoSportRegularlyPage } from './s7-do-sport-regularly.page';

const routes: Routes = [
  {
    path: '',
    component: S7DoSportRegularlyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S7DoSportRegularlyPageRoutingModule {}
