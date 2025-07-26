import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingProgramSelectionPage } from './training-program-selection.page';

const routes: Routes = [
  {
    path: '',
    component: TrainingProgramSelectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingProgramSelectionPageRoutingModule {}
