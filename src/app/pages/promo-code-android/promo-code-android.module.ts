import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromoCodeAndroidPageRoutingModule } from './promo-code-android-routing.module';

import { PromoCodeAndroidPage } from './promo-code-android.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PromoCodeAndroidPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [PromoCodeAndroidPage]
})
export class PromoCodeAndroidPageModule {}
