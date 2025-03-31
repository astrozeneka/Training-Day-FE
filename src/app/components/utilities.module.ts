import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { ChatMasterTabsComponent } from './chat-master-tabs/chat-master-tabs.component';
import { ChatMasterDiscussionListComponent } from './chat-master-discussion-list/chat-master-discussion-list.component';
import { RouterModule } from '@angular/router';
import { CoachChatSettingsComponent } from './coach-chat-settings/coach-chat-settings.component';
import { AngularInfiniteListV2Component } from '../components-submodules/angular-infinite-list-v2/angular-infinite-list-v2.component';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { OutlineInputComponent } from '../components-submodules/outline-input/outline-input.component';
import { SubscriptionBubblesComponent } from '../subscription-bubbles/subscription-bubbles.component';
import { AutorenewableBubblesComponent } from '../autorenewable-bubbles/autorenewable-bubbles.component';

// Swiper-js
import { register } from 'swiper/element';
import { BottomNavbarComponent } from './bottom-navbar/bottom-navbar.component';
import { RoundedCardComponent } from './rounded-card/rounded-card.component';
import { BottomNavbarPlaceholderComponent } from './bottom-navbar-placeholder/bottom-navbar-placeholder.component';
import { CondensedMenuItemComponent } from './condensed-menu-item/condensed-menu-item.component';
import { PromoOfferCardComponent } from './promo-offer-card/promo-offer-card.component';
import { ChipInputNg16Component } from '../components-submodules/chip-input-ng16/chip-input-ng16.component';
import { PromotionalBubbleSelectorComponent } from './promotional-bubble-selector/promotional-bubble-selector.component';
import { ErrorMessagePipe } from '../pipes/error-message.pipe';
import { BubbleMultiSelectorComponent } from './bubble-multi-selector/bubble-multi-selector.component';
import { LoaderV2Component } from './loader-v2/loader-v2.component';
import { ContinueWithGoogleButtonComponent } from './continue-with-google-button/continue-with-google-button.component';
import { ButtonToChatComponent } from './button-to-chat/button-to-chat.component';


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
    ChatMasterTabsComponent,
    ChatMasterDiscussionListComponent,
    CoachChatSettingsComponent,
    ImagePickerComponent,
    OutlineInputComponent,
    SubscriptionBubblesComponent,
    AutorenewableBubblesComponent,
    BottomNavbarComponent,
    RoundedCardComponent,
    BottomNavbarPlaceholderComponent,
    CondensedMenuItemComponent,
    PromoOfferCardComponent, // The UI is not suitable for the screen format
    PromotionalBubbleSelectorComponent,
    BubbleMultiSelectorComponent,
    LoaderV2Component,
    ContinueWithGoogleButtonComponent,
    ButtonToChatComponent,

    // Pipes
    DisplayListPipe,
    ErrorMessagePipe,

    // External projects
    UxButtonComponent,
    InfiniteListComponent,
    PhonePrefixSelectComponent,
    AngularInfiniteListV2Component,
    ChipInputNg16Component
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule
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
    ImagePickerComponent,
    OutlineInputComponent,
    SubscriptionBubblesComponent,
    AutorenewableBubblesComponent,
    BottomNavbarComponent,
    RoundedCardComponent,
    BottomNavbarPlaceholderComponent,
    CondensedMenuItemComponent,
    PromoOfferCardComponent,
    PromotionalBubbleSelectorComponent,
    BubbleMultiSelectorComponent,
    LoaderV2Component,
    ContinueWithGoogleButtonComponent,
    ButtonToChatComponent,
    
    DisplayListPipe,
    ChatMasterDiscussionListComponent,
    CoachChatSettingsComponent,


    // External projects
    UxButtonComponent,
    InfiniteListComponent,
    PhonePrefixSelectComponent,
    ChatMasterTabsComponent,
    AngularInfiniteListV2Component,
    ChipInputNg16Component
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UtilitiesModule { 
  constructor() {
    register()
  }
}
