import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAgenciesAddPageRoutingModule } from './manage-agencies-add-routing.module';

import { ManageAgenciesAddPage } from './manage-agencies-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAgenciesAddPageRoutingModule
  ],
  declarations: [ManageAgenciesAddPage]
})
export class ManageAgenciesAddPageModule {}
