import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoSubmenuPageRoutingModule } from './video-submenu-routing.module';

import { VideoSubmenuPage } from './video-submenu.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoSubmenuPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [VideoSubmenuPage]
})
export class VideoSubmenuPageModule {}
