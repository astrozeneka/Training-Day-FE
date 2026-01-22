import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodProgramMasterPage } from './food-program-master.page';

const routes: Routes = [
  {
    path: '',
    component: FoodProgramMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodProgramMasterPageRoutingModule {}
