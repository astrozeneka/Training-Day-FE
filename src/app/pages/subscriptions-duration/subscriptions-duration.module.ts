import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubscriptionsDurationPageRoutingModule } from './subscriptions-duration-routing.module';

import { SubscriptionsDurationPage } from './subscriptions-duration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubscriptionsDurationPageRoutingModule
  ],
  declarations: [SubscriptionsDurationPage]
})
export class SubscriptionsDurationPageModule {}
