import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
