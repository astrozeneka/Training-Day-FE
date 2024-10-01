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
import {DayoffViewComponent} from "./entity-views/dayoff-view/dayoff-view.component";
import {AppointmentViewComponent} from "./entity-views/appointment-view/appointment-view.component";
import {CommunityViewComponent} from "./entity-views/community-view/community-view.component";
import {PaymentViewComponent} from "./entity-views/payment-view/payment-view.component";
import {PostViewComponent} from "./entity-views/post-view/post-view.component";
import {ThreadViewComponent} from "./entity-views/thread-view/thread-view.component";
import {UserViewComponent} from "./entity-views/user-view/user-view.component";
import {UnavailableComponent} from "./unavailable/unavailable.component";
import {GoalViewComponent} from "./entity-views/goal-view/goal-view.component";
import {PasswordConfirmationModalComponent} from "./password-confirmation-modal/password-confirmation-modal.component";
import {UploadVideoComponent} from "./upload-video/upload-video.component";
import {ShopTabsComponent} from "./shop-tabs/shop-tabs.component";
import {BackButtonComponent} from "./back-button/back-button.component";
import {UxButtonComponent} from "../components-submodules/angular-ux-button/ux-button.component";
import {InfiniteListComponent} from "../components-submodules/angular-infinite-list/infinite-list.component";
import {TrainerCardComponent} from "./trainer-card/trainer-card.component";
import {SubscriptionCardComponent} from "./subscription-card/subscription-card.component";
import {FeedbackModalComponent} from "./feedback-modal/feedback-modal.component";
import { DisplayListPipe } from '../display-list.pipe';



@NgModule({
  declarations: [
    HeaderComponent,
    PageWrapperBasicComponent,
    FeedbackComponent,
    PaginationComponent,
    MainMenuComponent,
    DeleteModalComponent,
    PasswordConfirmationModalComponent,
    UploadVideoComponent,
    ShopTabsComponent,

    FileViewComponent,
    AgencyViewComponent,
    DayoffViewComponent,
    AppointmentViewComponent,
    CommunityViewComponent,
    PaymentViewComponent,
    PostViewComponent,
    ThreadViewComponent,
    UserViewComponent,
    GoalViewComponent,
    BackButtonComponent,

    UnavailableComponent,
    UxButtonComponent,
    InfiniteListComponent,
    TrainerCardComponent,
    SubscriptionCardComponent,

    FeedbackModalComponent,

    // Pipes
    DisplayListPipe
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
    FileViewComponent,
    GoalViewComponent,
    BackButtonComponent,

    UnavailableComponent,
    UploadVideoComponent,
    ShopTabsComponent,
    UxButtonComponent,
    InfiniteListComponent,
    TrainerCardComponent,
    SubscriptionCardComponent,
    
    DisplayListPipe
  ]
})
export class UtilitiesModule { }
