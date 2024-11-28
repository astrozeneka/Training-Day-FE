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
import { PhonePrefixSelectComponent } from '../components-submodules/phone-prefix-select/phone-prefix-select.component';
import { StorefrontItemComponent } from './storefront-item/storefront-item.component';
import { StoreAutoRenewablesComponent } from './store-auto-renewables/store-auto-renewables.component';
import { StoreFoodCoachComponent } from './store-food-coach/store-food-coach.component';
import { StoreSportCoachComponent } from './store-sport-coach/store-sport-coach.component';
import { SwipeableStoreTabsComponent } from './swipeable-store-tabs/swipeable-store-tabs.component';



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
    TrainerCardComponent,
    SubscriptionCardComponent,

    FeedbackModalComponent,
    StorefrontItemComponent,
    StoreAutoRenewablesComponent,
    StoreFoodCoachComponent,
    StoreSportCoachComponent,
    SwipeableStoreTabsComponent,

    // Pipes
    DisplayListPipe,

    // External projects
    UxButtonComponent,
    InfiniteListComponent,
    PhonePrefixSelectComponent
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
    TrainerCardComponent,
    SubscriptionCardComponent,
    StorefrontItemComponent,
    StoreAutoRenewablesComponent,
    StoreFoodCoachComponent,
    StoreSportCoachComponent,
    SwipeableStoreTabsComponent,
    
    DisplayListPipe,

    UxButtonComponent,
    InfiniteListComponent,
    PhonePrefixSelectComponent
  ]
})
export class UtilitiesModule { }
