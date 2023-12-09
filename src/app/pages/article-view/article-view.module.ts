import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticleViewPageRoutingModule } from './article-view-routing.module';

import { ArticleViewPage } from './article-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArticleViewPageRoutingModule
  ],
  declarations: [ArticleViewPage]
})
export class ArticleViewPageModule {}
