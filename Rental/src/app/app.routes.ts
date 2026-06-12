import { Routes } from '@angular/router';
import {MainComponent} from './layout/share/main-component/main-component';
import {AuthGuard} from './services/auth-guard';
import {RegisterComponent} from './layout/authentification/register-component/register-component';
import {LoginComponent} from './layout/authentification/login-component/login-component';
import {
  DashbordClassiqueComponent
} from './layout/profil_classique/dashbord-classique-component/dashbord-classique-component';
import {DashbordAirbnComponent} from './layout/profil_airbn/dashbord-airbn-component/dashbord-airbn-component';
import {Profile} from './layout/share/profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signUp',
    component: RegisterComponent,
  },
  // Redirection racine → login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Routes protégées
  {
    path: 'dashboard',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'classic',
        component: DashbordClassiqueComponent,
        children:[
          {
            path: 'profile',
            component: Profile,
          }
        ]
      },
      {
        path: 'airbn',
        component: DashbordAirbnComponent,
        children:[
          {
            path: 'profile',
            component: Profile,
          }
        ]
      }
    ]
  }
];
