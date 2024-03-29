import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseVerifyCompletePageRoutingModule } from './purchase-verify-complete-routing.module';

import { PurchaseVerifyCompletePage } from './purchase-verify-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseVerifyCompletePageRoutingModule
  ],
  declarations: [PurchaseVerifyCompletePage]
})
export class PurchaseVerifyCompletePageModule {}
