import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FirebaseGuardGuard } from '../app/guards/firebase-guard.guard'
import { LandingGuardGuard } from '../app/guards/landing-guard.guard'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [FirebaseGuardGuard]
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule),
    canActivate: [FirebaseGuardGuard]
  },
  {
    path: 'log-in',
    loadChildren: () => import('./pages/log-in/log-in.module').then(m => m.LogInPageModule),
    canActivate: [LandingGuardGuard]
  },
  {
    path: 'generated-results',
    loadChildren: () => import('./pages/generated-results/generated-results.module').then(m => m.GeneratedResultsPageModule),
    canActivate: [FirebaseGuardGuard]
  },
  {
    path: 'result-detail',
    loadChildren: () => import('./pages/result-detail/result-detail.module').then(m => m.ResultDetailPageModule),
    canActivate: [FirebaseGuardGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
