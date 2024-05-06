import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseInvoicePageRoutingModule } from './purchase-invoice-routing.module';

import { PurchaseInvoicePage } from './purchase-invoice.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseInvoicePageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule
  ],
  declarations: [PurchaseInvoicePage]
})
export class PurchaseInvoicePageModule {}
