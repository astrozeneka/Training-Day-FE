import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S5FoodAndWaterPageRoutingModule } from './s5-food-and-water-routing.module';

import { S5FoodAndWaterPage } from './s5-food-and-water.page';
import { UtilitiesModule } from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S5FoodAndWaterPageRoutingModule,
    UtilitiesModule
],
  declarations: [S5FoodAndWaterPage]
})
export class S5FoodAndWaterPageModule {}
