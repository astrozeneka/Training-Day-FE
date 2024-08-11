import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {QuillModule} from "ngx-quill";
import {HttpClientModule} from "@angular/common/http";
import {IonicStorageModule} from "@ionic/storage-angular";
import {UtilitiesModule} from "./components/utilities.module";
import { InAppPurchase2 } from "@ionic-native/in-app-purchase-2/ngx";
import {environment} from "../environments/environment";
import {DevComponentsModule} from "./dev-prod-components/dev-components.module";
import {ProdComponentsModule} from "./dev-prod-components/prod-components.module";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        UtilitiesModule,
      ...(!environment.production ? [DevComponentsModule] : [ProdComponentsModule])
    ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    InAppPurchase2
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
