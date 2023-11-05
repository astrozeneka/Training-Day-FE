import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAppointmentsViewPageRoutingModule } from './manage-appointments-view-routing.module';

import { ManageAppointmentsViewPage } from './manage-appointments-view.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAppointmentsViewPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ManageAppointmentsViewPage]
})
export class ManageAppointmentsViewPageModule {}
