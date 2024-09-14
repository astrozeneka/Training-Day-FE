import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppWeightTrackingPageRoutingModule } from './app-weight-tracking-routing.module';

import { AppWeightTrackingPage } from './app-weight-tracking.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

import { NgChartsModule } from 'ng2-charts';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppWeightTrackingPageRoutingModule,
    UtilitiesModule,
    NgChartsModule
  ],
  declarations: [AppWeightTrackingPage]
})
export class AppWeightTrackingPageModule {}
