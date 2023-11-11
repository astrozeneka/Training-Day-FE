import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePostsViewPageRoutingModule } from './manage-posts-view-routing.module';

import { ManagePostsViewPage } from './manage-posts-view.page';
import {FeedbackComponent} from "../../../components/feedback/feedback.component";
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ManagePostsViewPageRoutingModule,
        UtilitiesModule
    ],
  declarations: [
    ManagePostsViewPage,
    // FeedbackComponent
    // Now it is moved into the utilities module
  ]
})
export class ManagePostsViewPageModule {}
