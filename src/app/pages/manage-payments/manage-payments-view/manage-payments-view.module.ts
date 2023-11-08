import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManagePaymentsViewPageRoutingModule } from './manage-payments-view-routing.module';

import { ManagePaymentsViewPage } from './manage-payments-view.page';
import {UtilitiesModule} from "../../../components/utilities.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ManagePaymentsViewPageRoutingModule,
        UtilitiesModule
    ],
  declarations: [ManagePaymentsViewPage]
})
export class ManagePaymentsViewPageModule {}
