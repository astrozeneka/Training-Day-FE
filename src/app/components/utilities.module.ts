import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "./header/header.component";
import {IonicModule} from "@ionic/angular";
import {PageWrapperBasicComponent} from "./page-wrapper-basic/page-wrapper-basic.component";
import {ReactiveFormsModule} from "@angular/forms";
import {FeedbackComponent} from "./feedback/feedback.component";
import {PaginationComponent} from "./pagination/pagination.component";
import {DeleteModalComponent} from "./delete-modal/delete-modal.component";
import {MainMenuComponent} from "./main-menu/main-menu.component";
import {FileViewComponent} from "./entity-views/file-view/file-view.component";
import {AgencyViewComponent} from "./entity-views/agency-view/agency-view.component";



@NgModule({
  declarations: [
    HeaderComponent,
    PageWrapperBasicComponent,
    FeedbackComponent,
    PaginationComponent,
    MainMenuComponent,
    DeleteModalComponent,

    FileViewComponent,
    AgencyViewComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [
    HeaderComponent,
    PageWrapperBasicComponent,
    PaginationComponent,
    ReactiveFormsModule,
    DeleteModalComponent,
    MainMenuComponent,
    FileViewComponent
  ]
})
export class UtilitiesModule { }
