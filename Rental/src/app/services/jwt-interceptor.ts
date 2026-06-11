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

  /**
   * Intercepteur HTTP qui gère automatiquement :
   * - L'injection du token JWT dans les requêtes sortantes
   * - Le renouvellement silencieux du token en cas d'expiration (401)
   * - Les erreurs réseau (status 0 = serveur injoignable)
   */
  export class JwtInterceptor implements HttpInterceptor {

  /** Verrou pour éviter plusieurs appels simultanés au endpoint /refresh */
  private isRefreshing = false;

  /**
   * File d'attente des requêtes en attente du nouveau token.
   * Émet `null` pendant le refresh, puis le nouveau token dès qu'il est prêt.
   */
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  /**
   * Point d'entrée de l'intercepteur — appelé pour chaque requête HTTP sortante.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ── Routes publiques ──────────────────────────────────────────────────────
    // Les endpoints d'authentification n'ont pas besoin du token JWT
    // (et l'envoyer provoquerait des boucles infinies sur /refresh)
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next.handle(req);
    }

    // ── Injection du token ────────────────────────────────────────────────────
    // Récupère le token en mémoire et clone la requête avec le header Authorization
    const token = this.authService.getAccessToken();
    const authReq = token ? this.addToken(req, token) : req;

    // ── Gestion des erreurs ───────────────────────────────────────────────────
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // status 0 → pas de réponse du serveur (réseau coupé, serveur down,
        //             CORS bloqué, timeout réseau...)
        if (error.status === 0) {
          // On renvoie une erreur explicite pour que les composants puissent
          // afficher un message "Vérifiez votre connexion" plutôt qu'une erreur générique
          const networkError = new HttpErrorResponse({
            error: 'Serveur injoignable. Vérifiez votre connexion ou réessayez plus tard.',
            status: 0,
            statusText: 'Network Error',
            url: req.url,
          });
          return throwError(() => networkError);
        }

        // status 401 → token expiré ou absent : tentative de renouvellement silencieux
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }

        // Toute autre erreur HTTP (400, 403, 404, 500…) est propagée telle quelle
        return throwError(() => error);
      })
    );
  }

  /**
   * Clone la requête en y ajoutant le header `Authorization: Bearer <token>`.
   * On clone car les requêtes Angular sont immuables.
   */
  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Stratégie de refresh token (appelée uniquement sur les 401).
   *
   * Deux cas :
   * 1. Aucun refresh en cours → on déclenche le refresh, puis on relance la requête
   * 2. Refresh déjà en cours  → on met la requête en attente du nouveau token
   */
  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.isRefreshing) {
      // ── Cas 1 : démarrer le refresh ─────────────────────────────────────────
      this.isRefreshing = true;

      // On émet `null` pour signaler aux requêtes en attente de patienter
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(

        switchMap((response) => {
          this.isRefreshing = false;
          // Diffuse le nouveau token à toutes les requêtes en attente
          this.refreshTokenSubject.next(response.token);
          // Relance la requête originale avec le nouveau token
          return next.handle(this.addToken(req, response.token));
        }),

        catchError((error) => {
          // Le refresh a lui-même échoué (refresh token expiré ou révoqué)
          // → déconnexion forcée pour éviter une boucle infinie de 401
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    // ── Cas 2 : refresh déjà en cours ──────────────────────────────────────────
    // On s'abonne au Subject et on attend qu'il émette un token non-null,
    // puis on relance immédiatement la requête avec ce token.
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),  // ignore les émissions `null` (refresh en cours)
      take(1),                          // se désabonne après le premier token reçu
      switchMap(token => next.handle(this.addToken(req, token!)))
    );
  }

}
