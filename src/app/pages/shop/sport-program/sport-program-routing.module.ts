import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SportProgramPage } from './sport-program.page';

const routes: Routes = [
  {
    path: '',
    component: SportProgramPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SportProgramPageRoutingModule {}
