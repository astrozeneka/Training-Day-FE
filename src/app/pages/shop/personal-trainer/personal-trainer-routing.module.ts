import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalTrainerPage } from './personal-trainer.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalTrainerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalTrainerPageRoutingModule {}
