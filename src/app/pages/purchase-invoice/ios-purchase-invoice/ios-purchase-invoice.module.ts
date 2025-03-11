import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IosPurchaseInvoicePageRoutingModule } from './ios-purchase-invoice-routing.module';

import { IosPurchaseInvoicePage } from './ios-purchase-invoice.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IosPurchaseInvoicePageRoutingModule,
    UtilitiesModule
  ],
  declarations: [IosPurchaseInvoicePage]
})
export class IosPurchaseInvoicePageModule {}
