import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError} from "rxjs";
import {AuthService} from './auth-service';
@Injectable({
  providedIn: 'root',
})
export class JwtInterceptor implements HttpInterceptor{
  // Flag pour éviter plusieurs requêtes de refresh simultanées
  private isRefreshing = false;
  // Subject qui émet le nouveau token une fois obtenu
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne pas ajouter le token sur les routes auth (login, register)
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next.handle(req);
    }

    // Ajouter le token JWT dans le header Authorization
    const token = this.authService.getAccessToken();
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expiré → essayer de le renouveler automatiquement
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  // Cloner la requête avec le token dans le header
  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // Gérer le token expiré (401) : refresh puis relancer la requête
  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.token);
          // Relancer la requête originale avec le nouveau token
          return next.handle(this.addToken(req, response.token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Refresh échoué → déconnexion
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    // D'autres requêtes attendent le nouveau token → attendre et relancer
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(req, token!)))
    );
  }
}
