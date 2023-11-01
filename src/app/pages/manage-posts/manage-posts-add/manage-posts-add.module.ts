import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePostsAddPageRoutingModule } from './manage-posts-add-routing.module';

import { ManagePostsAddPage } from './manage-posts-add.page';
import {QuillModule} from "ngx-quill";
import {HttpClientModule} from "@angular/common/http";
import {IonicStorageModule} from "@ionic/storage-angular";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule.forRoot(),
        HttpClientModule,
        IonicStorageModule.forRoot(),
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
        ReactiveFormsModule,
    ],
  declarations: [ManagePostsAddPage]
})
export class ManagePostsAddPageModule {}
