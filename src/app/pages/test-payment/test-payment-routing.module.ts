import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestPaymentPage } from './test-payment.page';

const routes: Routes = [
  {
    path: '',
    component: TestPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestPaymentPageRoutingModule {}
