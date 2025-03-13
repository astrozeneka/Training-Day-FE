import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S7DoSportRegularlyPageRoutingModule } from './s7-do-sport-regularly-routing.module';

import { S7DoSportRegularlyPage } from './s7-do-sport-regularly.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S7DoSportRegularlyPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [S7DoSportRegularlyPage]
})
export class S7DoSportRegularlyPageModule {}
