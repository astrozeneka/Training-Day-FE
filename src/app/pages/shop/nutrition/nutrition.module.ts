import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NutritionPageRoutingModule } from './nutrition-routing.module';

import { NutritionPage } from './nutrition.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NutritionPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [NutritionPage]
})
export class NutritionPageModule {}
