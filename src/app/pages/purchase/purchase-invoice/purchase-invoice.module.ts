import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseInvoicePageRoutingModule } from './purchase-invoice-routing.module';

import { PurchaseInvoicePage } from './purchase-invoice.page';
import {UtilitiesModule} from "../../../components/utilities.module";
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchaseInvoicePageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule
  ],
  declarations: [PurchaseInvoicePage],
  providers: [
    ThemeDetection
  ]
})
export class PurchaseInvoicePageModule {}
