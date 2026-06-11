import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import {AuthService} from './auth-service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      // Utilisateur connecté → autoriser l'accès
      return true;
    }
    // Utilisateur non connecté → rediriger vers /login
    return this.router.createUrlTree(['']);
  }

}
