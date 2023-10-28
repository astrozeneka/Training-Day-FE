import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestPaymentPageRoutingModule } from './test-payment-routing.module';

import { TestPaymentPage } from './test-payment.page';
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestPaymentPageRoutingModule,
    HttpClientModule
  ],
  declarations: [TestPaymentPage]
})
export class TestPaymentPageModule {}
