import { Routes } from '@angular/router';
import {MainComponent} from './layout/share/main-component/main-component';
import {AuthGuard} from './services/auth-guard';
import {RegisterComponent} from './layout/authentification/register-component/register-component';
import {LoginComponent} from './layout/authentification/login-component/login-component';
import {
  DashbordClassiqueComponent
} from './layout/profil_classique/dashbord-classique-component/dashbord-classique-component';
import {DashbordAirbnComponent} from './layout/profil_airbn/dashbord-airbn-component/dashbord-airbn-component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'signUp',
    component: RegisterComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component:MainComponent,
    children: [
      {
        path: 'classic',
        component:DashbordClassiqueComponent
      },
      {
        path: 'airbn',
        component:DashbordAirbnComponent
      }
    ]
  }
];
