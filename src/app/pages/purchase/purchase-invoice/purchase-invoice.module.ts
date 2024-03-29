import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseInvoicePageRoutingModule } from './purchase-invoice-routing.module';

import { PurchaseInvoicePage } from './purchase-invoice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseInvoicePageRoutingModule
  ],
  declarations: [PurchaseInvoicePage]
})
export class PurchaseInvoicePageModule {}
