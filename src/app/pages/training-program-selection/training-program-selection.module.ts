import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrainingProgramSelectionPageRoutingModule } from './training-program-selection-routing.module';

import { TrainingProgramSelectionPage } from './training-program-selection.page';
import { UtilitiesModule } from '../../components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingProgramSelectionPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [TrainingProgramSelectionPage]
})
export class TrainingProgramSelectionPageModule {}
