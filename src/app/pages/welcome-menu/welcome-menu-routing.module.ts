import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeMenuPage } from './welcome-menu.page';

const routes: Routes = [
  {
    path: '',
    component: WelcomeMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WelcomeMenuPageRoutingModule {}
