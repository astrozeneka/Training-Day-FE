import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipeHomePage } from './recipe-home.page';

const routes: Routes = [
  {
    path: '',
    component: RecipeHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeHomePageRoutingModule {}
