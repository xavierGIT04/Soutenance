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
import {ListeComponent as classique} from './layout/profil_classique/biens/liste-component/liste-component';
import {ListeComponent as airbn } from './layout/profil_airbn/airbn/liste-component/liste-component';
import {UniteComponent} from './layout/profil_classique/biens/unite-component/unite-component';
import {BailComponent} from './layout/profil_classique/bails/bail-component/bail-component';

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
          },
          {
            path: 'proprietes',
            component: classique
          },
          {
            path: 'proprietes/:id/unites',
            component: UniteComponent
          },
          {
            path: 'baux',
            component: BailComponent
          }
        ]
      },
      {
        path: 'airbnb',
        component: DashbordAirbnComponent,
        children:[
          {
            path: 'profile',
            component: Profile,
          },
          {
            path: 'logements',
            component: airbn
          }
        ]
      }
    ]
  }
];
