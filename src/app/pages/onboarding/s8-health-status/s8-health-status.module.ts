import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S8HealthStatusPageRoutingModule } from './s8-health-status-routing.module';

import { S8HealthStatusPage } from './s8-health-status.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S8HealthStatusPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [S8HealthStatusPage]
})
export class S8HealthStatusPageModule {}
