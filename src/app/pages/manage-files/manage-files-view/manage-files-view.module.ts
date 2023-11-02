import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageFilesViewPageRoutingModule } from './manage-files-view-routing.module';

import { ManageFilesViewPage } from './manage-files-view.page';
import {HeaderComponent} from "../../../components/header/header.component";
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageFilesViewPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [
    ManageFilesViewPage
  ]
})
export class ManageFilesViewPageModule {}
