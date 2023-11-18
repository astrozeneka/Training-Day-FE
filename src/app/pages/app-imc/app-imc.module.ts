import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppImcPageRoutingModule } from './app-imc-routing.module';

import { AppImcPage } from './app-imc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppImcPageRoutingModule
  ],
  declarations: [AppImcPage]
})
export class AppImcPageModule {}
