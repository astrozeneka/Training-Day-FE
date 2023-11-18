import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppImcPage } from './app-imc.page';

const routes: Routes = [
  {
    path: '',
    component: AppImcPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppImcPageRoutingModule {}
