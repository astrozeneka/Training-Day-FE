import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePostsAddPage } from './manage-posts-add.page';
import {ReactiveFormsModule} from "@angular/forms";

const routes: Routes = [
  {
    path: '',
    component: ManagePostsAddPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class ManagePostsAddPageRoutingModule {}
