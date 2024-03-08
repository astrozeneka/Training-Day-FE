import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoViewPage } from './video-view.page';

const routes: Routes = [
  {
    path: '',
    component: VideoViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoViewPageRoutingModule {}
