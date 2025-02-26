import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'subscribe',
    loadChildren: () => import('./pages/subscribe/subscribe.module').then(m => m.SubscribePageModule)
  },
  {
    path: 'test-payment',
    loadChildren: () => import('./pages/test-payment/test-payment.module').then(m => m.TestPaymentPageModule)
  },
  {
    path: 'test-editor',
    loadChildren: () => import('./pages/test-editor/test-editor.module').then(m => m.TestEditorPageModule)
  },
  {
    path: 'manage/files/view',
    loadChildren: () => import('./pages/manage-files/manage-files-view/manage-files-view.module').then(m => m.ManageFilesViewPageModule)
  },
  {
    path: 'manage/files/add',
    loadChildren: () => import('./pages/manage-files/manage-files-add/manage-files-add.module').then(m => m.ManageFilesAddPageModule)
  },
  {
    path: 'manage/users/view',
    loadChildren: () => import('./pages/manage-users/manage-users-view/manage-users-view.module').then(m => m.ManageUsersViewPageModule)
  },
  {
    path: 'manage/payments/view',
    loadChildren: () => import('./pages/manage-payments/manage-payments-view/manage-payments-view.module').then(m => m.ManagePaymentsViewPageModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('./pages/logout/logout.module').then(m => m.LogoutPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat-master/chat-master.module').then(m => m.ChatMasterPageModule)
  },
  {
    path: 'chat/details/:id',
    loadChildren: () => import('./pages/chat/chat-details/chat-details.module').then(m => m.ChatDetailsPageModule)
  },
  {
    path: 'shop',
    loadChildren: () => import('./pages/shop/shop.module').then(m => m.ShopPageModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactPageModule)
  },
  {
    path: 'subscriptions',
    loadChildren: () => import('./pages/subscriptions/subscriptions.module').then(m => m.SubscriptionsPageModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule)
  },
  {
    path: 'app-imc',
    loadChildren: () => import('./pages/app-imc/app-imc.module').then(m => m.AppImcPageModule)
  },
  {
    path: 'app-gps',
    loadChildren: () => import('./pages/gps/gps.module').then(m => m.GpsPageModule)
  },
  {
    path: 'app-calories',
    loadChildren: () => import('./pages/app-calories/app-calories.module').then(m => m.AppCaloriesPageModule)
  },
  {
    path: 'app-timer',
    loadChildren: () => import('./pages/app-timer/app-timer.module').then(m => m.AppTimerPageModule)
  },
  {
    path: 'manage',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'video-upload',
    loadChildren: () => import('./pages/video-upload/video-upload.module').then(m => m.VideoUploadPageModule)
  },
  {
    path: 'subscriptions-duration',
    loadChildren: () => import('./pages/subscriptions-duration/subscriptions-duration.module').then(m => m.SubscriptionsDurationPageModule)
  },
  {
    path: 'subscriptions-invoice',
    loadChildren: () => import('./pages/subscriptions-invoice/subscriptions-invoice.module').then( m => m.SubscriptionsInvoicePageModule)
  },
  {
    path: 'subscriptions-verify-payment',
    loadChildren: () => import('./pages/subscriptions-verify-payment/subscriptions-verify-payment.module').then( m => m.SubscriptionsVerifyPaymentPageModule)
  },
  {
    path: 'subscriptions-verify-complete',
    loadChildren: () => import('./pages/subscriptions-verify-complete/subscriptions-verify-complete.module').then( m => m.SubscriptionsVerifyCompletePageModule)
  },
  {
    path: 'welcome-menu',
    loadChildren: () => import('./pages/welcome-menu/welcome-menu.module').then(m => m.WelcomeMenuPageModule)
  },
  {
    path: 'timeline',
    loadChildren: () => import('./pages/timeline/timeline.module').then(m => m.TimelinePageModule)
  },
  {
    path: 'video-view/:id',
    loadChildren: () => import('./pages/video-view/video-view.module').then(m => m.VideoViewPageModule)
  },
  {
    path: 'food-program',
    loadChildren: () => import('./pages/shop/food-program/food-program.module').then(m => m.FoodProgramPageModule)
  },
  {
    path: 'sport-program',
    loadChildren: () => import('./pages/shop/sport-program/sport-program.module').then(m => m.SportProgramPageModule)
  },
  {
    path: 'personal-trainer',
    loadChildren: () => import('./pages/shop/personal-trainer/personal-trainer.module').then(m => m.PersonalTrainerPageModule)
  },
  {
    path: 'nutrition',
    loadChildren: () => import('./pages/shop/nutrition/nutrition.module').then(m => m.NutritionPageModule),
    // Animation for later
  },
  {
    path: 'purchase-details',
    loadChildren: () => import('./pages/purchase/purchase-details/purchase-details.module').then(m => m.PurchaseDetailsPageModule)
  },
  {
    path: 'purchase-invoice',
    loadChildren: () => import('./pages/purchase/purchase-invoice/purchase-invoice.module').then( m => m.PurchaseInvoicePageModule)
  },
  {
    path: 'purchase-payment',
    loadChildren: () => import('./pages/purchase/purchase-payment/purchase-payment.module').then( m => m.PurchasePaymentPageModule)
  },
  {
    path: 'purchase-verify-complete',
    loadChildren: () => import('./pages/purchase/purchase-verify-complete/purchase-verify-complete.module').then( m => m.PurchaseVerifyCompletePageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'subscriptions-payment',
    loadChildren: () => import('./pages/subscriptions-payment/subscriptions-payment.module').then(m => m.SubscriptionsPaymentPageModule)
  },
  {
    path: 'videos',
    loadChildren: () => import('./pages/videos/videos.module').then(m => m.VideosPageModule)
  },
  {
    path: 'videos/:category',
    loadChildren: () => import('./pages/videos/videos.module').then(m => m.VideosPageModule)
  },
  {
    path: 'videos/:category/:subcategory',
    loadChildren: () => import('./pages/videos/videos.module').then(m => m.VideosPageModule)
  },
  {
    path: 'manage-personal-trainer',
    loadChildren: () => import('./pages/manage-personal-trainer/manage-personal-trainer.module').then(m => m.ManagePersonalTrainerPageModule)
  },
  {
    path: 'app-weight-tracking',
    loadChildren: () => import('./pages/app-weight-tracking/app-weight-tracking.module').then( m => m.AppWeightTrackingPageModule)
  },
  {
    path: 'app-weight-tracking/:id',
    loadChildren: () => import('./pages/app-weight-tracking/app-weight-tracking.module').then( m => m.AppWeightTrackingPageModule)
  },
  {
    path: 'set-appointment/:id',
    loadChildren: () => import('./pages/set-appointment/set-appointment.module').then( m => m.SetAppointmentPageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'verify-mail',
    loadChildren: () => import('./pages/verify-mail/verify-mail.module').then( m => m.VerifyMailPageModule)
  },
  {
    path: 'chat-master-placeholder',
    loadChildren: () => import('./pages/chat-master-placeholder/chat-master-placeholder.module').then( m => m.ChatMasterPlaceholderPageModule)
  },
  {
    path: 'shop',
    loadChildren: () => import('./pages/shop/shop.module').then( m => m.ShopPageModule)
  },
  {
    path: 'swipeable-store',
    loadChildren: () => import('./pages/swipeable-store/swipeable-store.module').then( m => m.StorePageModule)
  },
  {
    path: 'promo-code-android',
    loadChildren: () => import('./pages/promo-code-android/promo-code-android.module').then( m => m.PromoCodeAndroidPageModule)
  },
  {
    path: 'chat-detail-v4/:userId/:correspondentId',
    loadChildren: () => import('./pages/chat/chat-detail-v4/chat-detail-v4.module').then( m => m.ChatDetailV4PageModule)
  },
  {
    path: 'chat-master-v4',
    loadChildren: () => import('./pages/chat/chat-master-v4/chat-master-v4.module').then( m => m.ChatMasterV4PageModule)
  },
  {
    path: 'video-aws-test',
    loadChildren: () => import('./pages/video-aws-test/video-aws-test.module').then( m => m.VideoAwsTestPageModule)
  },
  {
    path: 'add-recipe',
    loadChildren: () => import('./pages/add-recipe/add-recipe.module').then( m => m.AddRecipePageModule)
  },
  {
    path: 'edit-recipe/:id',
    loadChildren: () => import('./pages/add-recipe/add-recipe.module').then( m => m.AddRecipePageModule)
  },
  {
    path: 'recipe-list',
    loadChildren: () => import('./pages/recipe-list/recipe-list.module').then( m => m.RecipeListPageModule)
  },
  {
    path: 'recipe-detail/:id',
    loadChildren: () => import('./pages/recipe-detail/recipe-detail.module').then( m => m.RecipeDetailPageModule)
  },
  {
    path: 'tools',
    loadChildren: () => import('./pages/tools/tools.module').then( m => m.ToolsPageModule)
  },
  {
    path: 'video-home',
    loadChildren: () => import('./pages/video-home/video-home.module').then( m => m.VideoHomePageModule)
  },
  {
    path: 'recipe-home',
    loadChildren: () => import('./pages/recipe-home/recipe-home.module').then( m => m.RecipeHomePageModule)
  },
  {
    path: 'recipe-by-category/:category',
    loadChildren: () => import('./pages/recipe-by-category/recipe-by-category.module').then( m => m.RecipeByCategoryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
