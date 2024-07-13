import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePersonalTrainerPage } from './manage-personal-trainer.page';

const routes: Routes = [
  {
    path: '',
    component: ManagePersonalTrainerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagePersonalTrainerPageRoutingModule {}
