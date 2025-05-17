import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseCategoriesPage } from './exercise-categories.page';

const routes: Routes = [
  {
    path: '',
    component: ExerciseCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseCategoriesPageRoutingModule {}
