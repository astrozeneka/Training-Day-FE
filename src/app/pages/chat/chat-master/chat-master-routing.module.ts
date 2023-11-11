import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatMasterPage } from './chat-master.page';

const routes: Routes = [
  {
    path: '',
    component: ChatMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatMasterPageRoutingModule {}
