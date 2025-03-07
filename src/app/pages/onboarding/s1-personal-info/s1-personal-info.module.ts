import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S1PersonalInfoPageRoutingModule } from './s1-personal-info-routing.module';

import { S1PersonalInfoPage } from './s1-personal-info.page';
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S1PersonalInfoPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [S1PersonalInfoPage]
})
export class S1PersonalInfoPageModule {}
