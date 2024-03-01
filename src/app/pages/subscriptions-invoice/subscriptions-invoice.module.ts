import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsInvoicePageRoutingModule } from './subscriptions-invoice-routing.module';

import { SubscriptionsInvoicePage } from './subscriptions-invoice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsInvoicePageRoutingModule
  ],
  declarations: [SubscriptionsInvoicePage]
})
export class SubscriptionsInvoicePageModule {}
