import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AndroidPurchaseInvoicePageRoutingModule } from './android-purchase-invoice-routing.module';

import { AndroidPurchaseInvoicePage } from './android-purchase-invoice.page';
import { UtilitiesModule } from '../../../components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AndroidPurchaseInvoicePageRoutingModule,
    UtilitiesModule
  ],
  declarations: [AndroidPurchaseInvoicePage]
})
export class AndroidPurchaseInvoicePageModule {}
