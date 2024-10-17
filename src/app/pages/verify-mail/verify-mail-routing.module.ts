import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyMailPage } from './verify-mail.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyMailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyMailPageRoutingModule {}
