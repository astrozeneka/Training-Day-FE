import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmAppointmentPageRoutingModule } from './confirm-appointment-routing.module';

import { ConfirmAppointmentPage } from './confirm-appointment.page';
import { UtilitiesModule } from '../../components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UtilitiesModule,
    ConfirmAppointmentPageRoutingModule
  ],
  declarations: [ConfirmAppointmentPage]
})
export class ConfirmAppointmentPageModule {}
