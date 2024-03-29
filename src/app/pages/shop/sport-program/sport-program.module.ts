import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SportProgramPageRoutingModule } from './sport-program-routing.module';

import { SportProgramPage } from './sport-program.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SportProgramPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [SportProgramPage]
})
export class SportProgramPageModule {}
