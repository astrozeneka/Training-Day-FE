import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePostsViewPage } from './manage-posts-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManagePostsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagePostsViewPageRoutingModule {}
