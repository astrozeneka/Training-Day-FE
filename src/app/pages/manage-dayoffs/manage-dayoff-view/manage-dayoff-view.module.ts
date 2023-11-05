import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageDayoffViewPageRoutingModule } from './manage-dayoff-view-routing.module';

import { ManageDayoffViewPage } from './manage-dayoff-view.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageDayoffViewPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ManageDayoffViewPage]
})
export class ManageDayoffViewPageModule {}
