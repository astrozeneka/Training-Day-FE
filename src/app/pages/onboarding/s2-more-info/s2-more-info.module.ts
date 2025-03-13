import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S2MoreInfoPageRoutingModule } from './s2-more-info-routing.module';

import { S2MoreInfoPage } from './s2-more-info.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S2MoreInfoPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [S2MoreInfoPage]
})
export class S2MoreInfoPageModule {}
