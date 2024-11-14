import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatMasterPlaceholderPage } from './chat-master-placeholder.page';

const routes: Routes = [
  {
    path: '',
    component: ChatMasterPlaceholderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatMasterPlaceholderPageRoutingModule {}
