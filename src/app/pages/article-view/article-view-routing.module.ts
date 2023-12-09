import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArticleViewPage } from './article-view.page';

const routes: Routes = [
  {
    path: '',
    component: ArticleViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticleViewPageRoutingModule {}
