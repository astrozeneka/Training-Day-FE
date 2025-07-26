// Angular core imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Third-party library imports
import { IonicModule } from '@ionic/angular';

// Local application imports
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
