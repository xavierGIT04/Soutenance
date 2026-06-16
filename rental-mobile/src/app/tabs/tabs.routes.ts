import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'echeances',
        loadComponent: () => import('../pages/echeances/echeances.page').then((m) => m.EcheancesPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('../pages/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profil',
        loadComponent: () => import('../pages/profil/profil.page').then((m) => m.ProfilPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
