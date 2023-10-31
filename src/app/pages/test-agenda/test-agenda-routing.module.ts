import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestAgendaPage } from './test-agenda.page';

const routes: Routes = [
  {
    path: '',
    component: TestAgendaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestAgendaPageRoutingModule {}
