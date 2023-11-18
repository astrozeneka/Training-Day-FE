import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppCaloriesPageRoutingModule } from './app-calories-routing.module';

import { AppCaloriesPage } from './app-calories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppCaloriesPageRoutingModule
  ],
  declarations: [AppCaloriesPage]
})
export class AppCaloriesPageModule {}
