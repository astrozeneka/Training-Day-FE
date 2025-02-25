import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoHomePage } from './video-home.page';

const routes: Routes = [
  {
    path: '',
    component: VideoHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoHomePageRoutingModule {}
