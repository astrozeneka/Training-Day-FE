import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalTrainerPageRoutingModule } from './personal-trainer-routing.module';

import { PersonalTrainerPage } from './personal-trainer.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalTrainerPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [PersonalTrainerPage]
})
export class PersonalTrainerPageModule {}
