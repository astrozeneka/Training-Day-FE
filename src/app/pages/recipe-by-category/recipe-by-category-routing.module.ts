import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipeByCategoryPage } from './recipe-by-category.page';

const routes: Routes = [
  {
    path: '',
    component: RecipeByCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeByCategoryPageRoutingModule {}
