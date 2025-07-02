import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeV2Page } from './home-v2.page';

const routes: Routes = [
  {
    path: '',
    component: HomeV2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeV2PageRoutingModule {}
