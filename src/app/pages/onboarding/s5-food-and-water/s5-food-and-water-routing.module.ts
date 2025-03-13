import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S5FoodAndWaterPage } from './s5-food-and-water.page';

const routes: Routes = [
  {
    path: '',
    component: S5FoodAndWaterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S5FoodAndWaterPageRoutingModule {}
