import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsInvoicePageRoutingModule } from './subscriptions-invoice-routing.module';

import { SubscriptionsInvoicePage } from './subscriptions-invoice.page';
import {UtilitiesModule} from "../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsInvoicePageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule
  ],
  declarations: [SubscriptionsInvoicePage]
})
export class SubscriptionsInvoicePageModule {}
