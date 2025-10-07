import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {QuillModule} from "ngx-quill";
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule, provideHttpClient, withInterceptorsFromDi, withXsrfConfiguration} from "@angular/common/http";
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
import { ConversationCacheInterceptor } from './messenger-master/messenger-master.page';

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
        /*HttpClientModule,
        HttpClientXsrfModule.withOptions({
          cookieName: 'XSRF-TOKEN',
          headerName: 'X-XSRF-TOKEN'
        }),*/
        IonicStorageModule.forRoot(),
        UtilitiesModule,
      ...(!environment.production ? [DevComponentsModule] : [ProdComponentsModule])
    ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    InAppPurchase2,
    ThemeDetection,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ConversationCacheInterceptor,
      multi: true
    },
    provideHttpClient(
      withInterceptorsFromDi(),
      // Enable XSRF protection (defaults to cookie 'XSRF-TOKEN' and header 'X-XSRF-TOKEN'):
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    )
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
