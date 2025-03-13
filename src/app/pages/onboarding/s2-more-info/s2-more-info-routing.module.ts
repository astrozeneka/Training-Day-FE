import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S2MoreInfoPage } from './s2-more-info.page';

const routes: Routes = [
  {
    path: '',
    component: S2MoreInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S2MoreInfoPageRoutingModule {}
