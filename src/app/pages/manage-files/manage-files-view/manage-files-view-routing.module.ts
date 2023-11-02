import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageFilesViewPage } from './manage-files-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageFilesViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageFilesViewPageRoutingModule {}
