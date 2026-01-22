import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodProgramMasterPageRoutingModule } from './food-program-master-routing.module';

import { FoodProgramMasterPage } from './food-program-master.page';
import { UtilitiesModule } from "../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodProgramMasterPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [FoodProgramMasterPage]
})
export class FoodProgramMasterPageModule {}
