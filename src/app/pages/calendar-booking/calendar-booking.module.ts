import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarBookingPageRoutingModule } from './calendar-booking-routing.module';

import { CalendarBookingPage } from './calendar-booking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarBookingPageRoutingModule
  ],
  declarations: [CalendarBookingPage]
})
export class CalendarBookingPageModule {}
