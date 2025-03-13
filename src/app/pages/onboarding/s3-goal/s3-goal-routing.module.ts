import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { S3GoalPage } from './s3-goal.page';

const routes: Routes = [
  {
    path: '',
    component: S3GoalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class S3GoalPageRoutingModule {}
