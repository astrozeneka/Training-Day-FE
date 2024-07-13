import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePersonalTrainerPageRoutingModule } from './manage-personal-trainer-routing.module';

import { ManagePersonalTrainerPage } from './manage-personal-trainer.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManagePersonalTrainerPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ManagePersonalTrainerPage]
})
export class ManagePersonalTrainerPageModule {}
