import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodProgramPageRoutingModule } from './food-program-routing.module';

import { FoodProgramPage } from './food-program.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodProgramPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [FoodProgramPage]
})
export class FoodProgramPageModule {}
