import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePostsAddPageRoutingModule } from './manage-posts-add-routing.module';

import { ManagePostsAddPage } from './manage-posts-add.page';
import {QuillModule} from "ngx-quill";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    ManagePostsAddPageRoutingModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike']
        ],
        syntax: true
      },
      formats: ['bold', 'italic', 'underline']
    }),
  ],
  declarations: [ManagePostsAddPage]
})
export class ManagePostsAddPageModule {}
