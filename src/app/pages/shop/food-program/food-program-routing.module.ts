import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodProgramPage } from './food-program.page';

const routes: Routes = [
  {
    path: '',
    component: FoodProgramPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodProgramPageRoutingModule {}
