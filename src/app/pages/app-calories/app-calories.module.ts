import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppCaloriesPageRoutingModule } from './app-calories-routing.module';

import { AppCaloriesPage } from './app-calories.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AppCaloriesPageRoutingModule,
        UtilitiesModule
    ],
  declarations: [AppCaloriesPage]
})
export class AppCaloriesPageModule {}
