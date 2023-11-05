import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageDayoffViewPageRoutingModule } from './manage-dayoff-view-routing.module';

import { ManageDayoffViewPage } from './manage-dayoff-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageDayoffViewPageRoutingModule
  ],
  declarations: [ManageDayoffViewPage]
})
export class ManageDayoffViewPageModule {}
