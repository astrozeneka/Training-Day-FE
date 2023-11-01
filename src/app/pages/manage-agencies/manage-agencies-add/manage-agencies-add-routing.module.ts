import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAgenciesAddPage } from './manage-agencies-add.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAgenciesAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAgenciesAddPageRoutingModule {}
