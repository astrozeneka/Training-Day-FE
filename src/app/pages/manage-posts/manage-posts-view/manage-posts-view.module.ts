import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePostsViewPageRoutingModule } from './manage-posts-view-routing.module';

import { ManagePostsViewPage } from './manage-posts-view.page';
import {FeedbackComponent} from "../../../components/feedback/feedback.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManagePostsViewPageRoutingModule
  ],
  declarations: [
    ManagePostsViewPage,
    FeedbackComponent
  ]
})
export class ManagePostsViewPageModule {}
