import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S8HealthStatusPageRoutingModule } from './s8-health-status-routing.module';

import { S8HealthStatusPage } from './s8-health-status.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S8HealthStatusPageRoutingModule
  ],
  declarations: [S8HealthStatusPage]
})
export class S8HealthStatusPageModule {}
