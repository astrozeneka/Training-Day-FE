import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAgenciesViewPage } from './manage-agencies-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAgenciesViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAgenciesViewPageRoutingModule {}
