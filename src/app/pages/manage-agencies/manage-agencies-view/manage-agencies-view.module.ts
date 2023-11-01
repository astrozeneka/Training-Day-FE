import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAgenciesViewPageRoutingModule } from './manage-agencies-view-routing.module';

import { ManageAgenciesViewPage } from './manage-agencies-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAgenciesViewPageRoutingModule
  ],
  declarations: [ManageAgenciesViewPage]
})
export class ManageAgenciesViewPageModule {}
