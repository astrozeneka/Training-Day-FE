import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestEditorPageRoutingModule } from './test-editor-routing.module';

import { TestEditorPage } from './test-editor.page';
import { QuillModule } from 'ngx-quill'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestEditorPageRoutingModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline']
        ],
        syntax: true
      },
      formats: ['bold', 'italic', 'underline']
    }),
  ],
  declarations: [TestEditorPage]
})
export class TestEditorPageModule {}
