import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeByCategoryPageRoutingModule } from './recipe-by-category-routing.module';

import { RecipeByCategoryPage } from './recipe-by-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeByCategoryPageRoutingModule
  ],
  declarations: [RecipeByCategoryPage]
})
export class RecipeByCategoryPageModule {}
