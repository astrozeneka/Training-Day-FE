import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeHomePageRoutingModule } from './recipe-home-routing.module';

import { RecipeHomePage } from './recipe-home.page';
import { UtilitiesModule } from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeHomePageRoutingModule,
    UtilitiesModule
],
  declarations: [RecipeHomePage]
})
export class RecipeHomePageModule {}
