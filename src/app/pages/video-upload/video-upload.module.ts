import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoUploadPageRoutingModule } from './video-upload-routing.module';

import { VideoUploadPage } from './video-upload.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoUploadPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [VideoUploadPage]
})
export class VideoUploadPageModule {}
