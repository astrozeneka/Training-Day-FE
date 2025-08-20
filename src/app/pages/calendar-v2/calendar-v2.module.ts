import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarV2PageRoutingModule } from './calendar-v2-routing.module';

import { CalendarV2Page } from './calendar-v2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarV2PageRoutingModule
  ],
  declarations: [CalendarV2Page]
})
export class CalendarV2PageModule {}
