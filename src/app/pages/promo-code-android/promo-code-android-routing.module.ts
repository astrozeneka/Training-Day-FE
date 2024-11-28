import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromoCodeAndroidPage } from './promo-code-android.page';

const routes: Routes = [
  {
    path: '',
    component: PromoCodeAndroidPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromoCodeAndroidPageRoutingModule {}
