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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
