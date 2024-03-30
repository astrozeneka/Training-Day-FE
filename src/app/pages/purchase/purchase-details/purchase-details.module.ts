import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseDetailsPageRoutingModule } from './purchase-details-routing.module';

import { PurchaseDetailsPage } from './purchase-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseDetailsPageRoutingModule
  ],
  declarations: [PurchaseDetailsPage]
})
export class PurchaseDetailsPageModule {}
