import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestAgendaPageRoutingModule } from './test-agenda-routing.module';

import { TestAgendaPage } from './test-agenda.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestAgendaPageRoutingModule
  ],
  declarations: [TestAgendaPage]
})
export class TestAgendaPageModule {}
