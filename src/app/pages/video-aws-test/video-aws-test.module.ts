import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoAwsTestPageRoutingModule } from './video-aws-test-routing.module';

import { VideoAwsTestPage } from './video-aws-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoAwsTestPageRoutingModule
  ],
  declarations: [VideoAwsTestPage]
})
export class VideoAwsTestPageModule {}
