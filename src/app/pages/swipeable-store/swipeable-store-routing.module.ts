import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwipeableStorePage } from './swipeable-store.page';

const routes: Routes = [
  {
    path: '',
    component: SwipeableStorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwipeableStorePageRoutingModule {}
