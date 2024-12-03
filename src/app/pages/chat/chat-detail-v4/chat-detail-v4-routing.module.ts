import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatDetailV4Page } from './chat-detail-v4.page';

const routes: Routes = [
  {
    path: '',
    component: ChatDetailV4Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatDetailV4PageRoutingModule {}
