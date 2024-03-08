import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoViewPageRoutingModule } from './video-view-routing.module';

import { VideoViewPage } from './video-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoViewPageRoutingModule
  ],
  declarations: [VideoViewPage]
})
export class VideoViewPageModule {}
