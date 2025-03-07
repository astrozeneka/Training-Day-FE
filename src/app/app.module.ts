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
import { DisplayListPipe } from './display-list.pipe';
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';
import { CustomRouteReuseStrategy } from './custom-route-reuse-strategy';
import { DisplayPricePipe } from './pipes/display-price.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DisplayPricePipe
  ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
          innerHTMLTemplatesEnabled: true
        }),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        UtilitiesModule,
      ...(!environment.production ? [DevComponentsModule] : [ProdComponentsModule])
    ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    InAppPurchase2,
    ThemeDetection
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
