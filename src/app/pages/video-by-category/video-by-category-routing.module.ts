import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoByCategoryPage } from './video-by-category.page';

const routes: Routes = [
  {
    path: '',
    component: VideoByCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoByCategoryPageRoutingModule {}
