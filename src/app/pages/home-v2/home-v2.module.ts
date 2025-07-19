import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeV2PageRoutingModule } from './home-v2-routing.module';

import { HomeV2Page } from './home-v2.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeV2PageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule
  ],
  declarations: [HomeV2Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeV2PageModule {}
