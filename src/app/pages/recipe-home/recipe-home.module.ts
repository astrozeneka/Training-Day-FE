import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeHomePageRoutingModule } from './recipe-home-routing.module';

import { RecipeHomePage } from './recipe-home.page';
import { UtilitiesModule } from "../../components/utilities.module";
import { RecipesTabComponent } from './recipes-tab.component';
import { ProgramsTabComponent } from './programs-tab.component';
import { FoodProgramListComponent } from './food-program-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeHomePageRoutingModule,
    UtilitiesModule
],
  declarations: [
    RecipeHomePage,
    RecipesTabComponent,
    ProgramsTabComponent,
    FoodProgramListComponent
  ]
})
export class RecipeHomePageModule {}
