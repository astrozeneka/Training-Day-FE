import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageCommunitiesViewPageRoutingModule } from './manage-communities-view-routing.module';

import { ManageCommunitiesViewPage } from './manage-communities-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageCommunitiesViewPageRoutingModule
  ],
  declarations: [ManageCommunitiesViewPage]
})
export class ManageCommunitiesViewPageModule {}
