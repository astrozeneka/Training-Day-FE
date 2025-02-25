import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestEditorPageRoutingModule } from './test-editor-routing.module';

import { TestEditorPage } from './test-editor.page';
import { QuillModule } from 'ngx-quill'
import { UtilitiesModule } from 'src/app/components/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestEditorPageRoutingModule,
    UtilitiesModule,
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
  declarations: [TestEditorPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestEditorPageModule {}
