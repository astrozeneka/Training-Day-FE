import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageDayoffViewPage } from './manage-dayoff-view.page';

const routes: Routes = [
  {
    path: '',
    component: ManageDayoffViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageDayoffViewPageRoutingModule {}
