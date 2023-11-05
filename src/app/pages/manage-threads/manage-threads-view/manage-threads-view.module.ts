import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageThreadsViewPageRoutingModule } from './manage-threads-view-routing.module';

import { ManageThreadsViewPage } from './manage-threads-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageThreadsViewPageRoutingModule
  ],
  declarations: [ManageThreadsViewPage]
})
export class ManageThreadsViewPageModule {}
