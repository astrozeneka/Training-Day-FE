import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCommunitiesViewPage } from './manage-communities-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageCommunitiesViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageCommunitiesViewPageRoutingModule {}
