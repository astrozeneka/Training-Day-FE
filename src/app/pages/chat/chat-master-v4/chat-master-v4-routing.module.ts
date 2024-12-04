import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatMasterV4Page } from './chat-master-v4.page';

const routes: Routes = [
  {
    path: '',
    component: ChatMasterV4Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatMasterV4PageRoutingModule {}
