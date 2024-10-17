import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifyMailPageRoutingModule } from './verify-mail-routing.module';

import { VerifyMailPage } from './verify-mail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifyMailPageRoutingModule
  ],
  declarations: [VerifyMailPage]
})
export class VerifyMailPageModule {}
