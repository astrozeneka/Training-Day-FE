import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExerciseCategoriesPageRoutingModule } from './exercise-categories-routing.module';

import { ExerciseCategoriesPage } from './exercise-categories.page';
import { UtilitiesModule } from '../components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseCategoriesPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ExerciseCategoriesPage]
})
export class ExerciseCategoriesPageModule {}
