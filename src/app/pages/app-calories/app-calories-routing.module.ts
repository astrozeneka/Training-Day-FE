import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppCaloriesPage } from './app-calories.page';

const routes: Routes = [
  {
    path: '',
    component: AppCaloriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppCaloriesPageRoutingModule {}
