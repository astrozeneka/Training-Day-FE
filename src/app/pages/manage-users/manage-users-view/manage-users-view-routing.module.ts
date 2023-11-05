import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageUsersViewPage } from './manage-users-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageUsersViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersViewPageRoutingModule {}
