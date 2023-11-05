import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageUsersViewPageRoutingModule } from './manage-users-view-routing.module';

import { ManageUsersViewPage } from './manage-users-view.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageUsersViewPageRoutingModule,
    UtilitiesModule
  ],
  declarations: [ManageUsersViewPage]
})
export class ManageUsersViewPageModule {}
