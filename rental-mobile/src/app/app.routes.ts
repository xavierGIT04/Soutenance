import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.tabsRoutes),
  },
  {
    path: 'contrat/:uuid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/contrat-detail/contrat-detail.page').then((m) => m.ContratDetailPage),
  },
  {
    path: 'echeance/:uuid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/echeance-detail/echeance-detail.page').then((m) => m.EcheanceDetailPage),
  },
  {
    path: 'paiement/:uuid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/paiement/paiement.page').then((m) => m.PaiementPage),
  },
  {
    path: '**',
    redirectTo: 'tabs',
  },
];
