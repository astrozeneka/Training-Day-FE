import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import {UtilitiesModule} from "../../components/utilities.module";
import {DevComponentsModule} from "../../dev-prod-components/dev-components.module";
import {environment} from "../../../environments/environment";
import {ProdComponentsModule} from "../../dev-prod-components/prod-components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    ReactiveFormsModule,
    UtilitiesModule,
    ...(!environment.production ? [DevComponentsModule] : [ProdComponentsModule])
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
