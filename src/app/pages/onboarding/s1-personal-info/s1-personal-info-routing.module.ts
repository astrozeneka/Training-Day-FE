import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S1PersonalInfoPage } from './s1-personal-info.page';

const routes: Routes = [
  {
    path: '',
    component: S1PersonalInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S1PersonalInfoPageRoutingModule {}
