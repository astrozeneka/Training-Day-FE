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
    path: 'test-agenda',
    loadChildren: () => import('./pages/test-agenda/test-agenda.module').then(m => m.TestAgendaPageModule)
  },
  {
    path: 'manage/posts/view',
    loadChildren: () => import('./pages/manage-posts/manage-posts-view/manage-posts-view.module').then(m => m.ManagePostsViewPageModule)
  },
  {
    path: 'manage/posts/add',
    loadChildren: () => import('./pages/manage-posts/manage-posts-add/manage-posts-add.module').then(m => m.ManagePostsAddPageModule)
  },
  {
    path: 'manage/agencies/view',
    loadChildren: () => import('./pages/manage-agencies/manage-agencies-view/manage-agencies-view.module').then(m => m.ManageAgenciesViewPageModule)
  },
  {
    path: 'manage/agencies/add',
    loadChildren: () => import('./pages/manage-agencies/manage-agencies-add/manage-agencies-add.module').then(m => m.ManageAgenciesAddPageModule)
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
    path: 'manage/dayoff/view',
    loadChildren: () => import('./pages/manage-dayoffs/manage-dayoff-view/manage-dayoff-view.module').then(m => m.ManageDayoffViewPageModule)
  },
  {
    path: 'manage/appointments/view',
    loadChildren: () => import('./pages/manage-appointments/manage-appointments-view/manage-appointments-view.module').then(m => m.ManageAppointmentsViewPageModule)
  },
  {
    path: 'manage/users/view',
    loadChildren: () => import('./pages/manage-users/manage-users-view/manage-users-view.module').then(m => m.ManageUsersViewPageModule)
  },
  {
    path: 'manage/posts-view',
    loadChildren: () => import('./pages/manage-posts/manage-posts-view/manage-posts-view.module').then( m => m.ManagePostsViewPageModule)
  },
  {
    path: 'manage/threads/view',
    loadChildren: () => import('./pages/manage-threads/manage-threads-view/manage-threads-view.module').then(m => m.ManageThreadsViewPageModule)
  },
  {
    path: 'manage/communities/view',
    loadChildren: () => import('./pages/manage-communities/manage-communities-view/manage-communities-view.module').then(m => m.ManageCommunitiesViewPageModule)
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
    path: 'communities',
    loadChildren: () => import('./pages/communities/communities.module').then(m => m.CommunitiesPageModule)
  },
  {
    path: 'goals',
    loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule)
  },
  {
    path: 'programs',
    loadChildren: () => import('./pages/programs/programs.module').then(m => m.ProgramsPageModule)
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
    path: 'article/:id',
    loadChildren: () => import('./pages/article-view/article-view.module').then(m => m.ArticleViewPageModule)
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
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
