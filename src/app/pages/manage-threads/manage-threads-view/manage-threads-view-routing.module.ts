import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageThreadsViewPage } from './manage-threads-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageThreadsViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageThreadsViewPageRoutingModule {}
