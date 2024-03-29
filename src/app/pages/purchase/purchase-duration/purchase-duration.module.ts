import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseDurationPageRoutingModule } from './purchase-duration-routing.module';

import { PurchaseDurationPage } from './purchase-duration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseDurationPageRoutingModule
  ],
  declarations: [PurchaseDurationPage]
})
export class PurchaseDurationPageModule {}
