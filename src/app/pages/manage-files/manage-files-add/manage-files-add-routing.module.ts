import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageFilesAddPage } from './manage-files-add.page';

const routes: Routes = [
  {
    path: '',
    component: ManageFilesAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageFilesAddPageRoutingModule {}
