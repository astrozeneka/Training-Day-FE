import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageFilesAddPageRoutingModule } from './manage-files-add-routing.module';

import { ManageFilesAddPage } from './manage-files-add.page';
import {HeaderComponent} from "../../../components/header/header.component";
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageFilesAddPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [
    ManageFilesAddPage
  ]
})
export class ManageFilesAddPageModule {}
