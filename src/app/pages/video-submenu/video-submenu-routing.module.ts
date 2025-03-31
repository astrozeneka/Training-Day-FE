import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoSubmenuPage } from './video-submenu.page';

const routes: Routes = [
  {
    path: '',
    component: VideoSubmenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoSubmenuPageRoutingModule {}
