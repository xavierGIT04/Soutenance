import {HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import { inject } from '@angular/core';
import {BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError} from 'rxjs';

import { AuthService } from '../services/auth-service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next):Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Routes publiques : pas de token
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse):Observable<HttpEvent<unknown>> => {
      if (error.status === 401) {
        return handle401(req, authService, next);
      }
      return throwError(() => error);
    }),
  );
};

function handle401(req:  HttpRequest<unknown>, authService: AuthService, next: any):Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res):Observable<HttpEvent<unknown>> => {
        isRefreshing = false;
        refreshTokenSubject.next(res.accessToken);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token): Observable<HttpEvent<unknown>> => {
      return next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })
      );
    })
  );
}
