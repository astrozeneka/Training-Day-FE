import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseInvoicePageRoutingModule } from './purchase-invoice-routing.module';

import { PurchaseInvoicePage } from './purchase-invoice.page';
import {UtilitiesModule} from "../../../components/utilities.module";
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';
import { register } from 'swiper/element';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PurchaseInvoicePageModule {
  constructor() {
    register() // no need to sue this
  }
}
