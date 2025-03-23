import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { S3GoalPageRoutingModule } from './s3-goal-routing.module';

import { S3GoalPage } from './s3-goal.page';
import { UtilitiesModule } from "../../../components/utilities.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    S3GoalPageRoutingModule,
    UtilitiesModule
],
  declarations: [S3GoalPage]
})
export class S3GoalPageModule {}
