import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S6ActivityPageRoutingModule } from './s6-activity-routing.module';

import { S6ActivityPage } from './s6-activity.page';
import { UtilitiesModule } from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S6ActivityPageRoutingModule,
    UtilitiesModule
],
  declarations: [S6ActivityPage]
})
export class S6ActivityPageModule {}
