import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffAppointmentPageRoutingModule } from './staff-appointment-routing.module';

import { StaffAppointmentPage } from './staff-appointment.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UtilitiesModule,
    StaffAppointmentPageRoutingModule
  ],
  declarations: [StaffAppointmentPage]
})
export class StaffAppointmentPageModule {}
