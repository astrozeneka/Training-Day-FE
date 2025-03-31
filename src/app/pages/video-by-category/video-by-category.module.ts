import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoByCategoryPageRoutingModule } from './video-by-category-routing.module';

import { VideoByCategoryPage } from './video-by-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoByCategoryPageRoutingModule
  ],
  declarations: [VideoByCategoryPage]
})
export class VideoByCategoryPageModule {}
