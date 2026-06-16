import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastService.showError('Serveur injoignable. Vérifiez votre connexion internet.');
      } else if (error.status === 403) {
        toastService.showError('Accès refusé pour cette action.');
      } else if (error.status >= 500) {
        toastService.showError('Une erreur serveur est survenue. Réessayez plus tard.');
      }
      return throwError(() => error);
    }),
  );
};
