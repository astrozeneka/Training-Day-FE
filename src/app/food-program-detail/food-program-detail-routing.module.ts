import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodProgramDetailPage } from './food-program-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FoodProgramDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodProgramDetailPageRoutingModule {}
