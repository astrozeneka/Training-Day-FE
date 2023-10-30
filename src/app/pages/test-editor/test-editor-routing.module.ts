import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestEditorPage } from './test-editor.page';

const routes: Routes = [
  {
    path: '',
    component: TestEditorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestEditorPageRoutingModule {}
