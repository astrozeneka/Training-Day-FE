import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoUploadPage } from './video-upload.page';

const routes: Routes = [
  {
    path: '',
    component: VideoUploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoUploadPageRoutingModule {}
