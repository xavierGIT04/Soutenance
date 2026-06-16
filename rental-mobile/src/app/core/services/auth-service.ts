import {inject, Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthRequest,
  AuthResponse,
  RoleEnum,
  UpdateInfosRequest,
  UtilisateurResponse,
} from '../models/auth.model';

const TOKEN_KEY = 'rl_token';
const REFRESH_KEY = 'rl_refresh_token';
const UUID_KEY = 'rl_user_uuid';
const NOM_KEY = 'rl_user_nom';
const TEL_KEY = 'rl_user_telephone';
const ROLE_KEY = 'rl_user_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.ApiURl}/auth/`;


  readonly currentUser = signal<UtilisateurResponse | null>(null);
  readonly isLoggedIn = signal<boolean>(this.hasValidToken());
  private http= inject(HttpClient);
  private router = inject(Router);

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}login`, credentials).pipe(
      tap((res) => {
        this.storeAuthData(res);
        this.isLoggedIn.set(true);
      }),
      catchError(this.handleError),
    );
  }

  getMe(): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}me`).pipe(
      tap((infos) => this.currentUser.set(infos)),
    );
  }

  updateInfos(payload: UpdateInfosRequest): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}update_info`, payload).pipe(
      tap((infos) => this.currentUser.set(infos)),
    );
  }

  updateAvatar(url: string): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}update_avatar`, url).pipe(
      tap((infos) => this.currentUser.set(infos)),
    );
  }

  refreshToken(): Observable<{ accessToken: string; expiresIn: number }> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Pas de refresh token'));
    }
    return this.http.post<{ accessToken: string; expiresIn: number }>(`${this.apiUrl}refresh`, { refreshToken }).pipe(
      tap((res) => localStorage.setItem(TOKEN_KEY, res.accessToken)),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(UUID_KEY);
    localStorage.removeItem(NOM_KEY);
    localStorage.removeItem(TEL_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserRole(): RoleEnum | null {
    return (localStorage.getItem(ROLE_KEY) as RoleEnum) ?? null;
  }

  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(REFRESH_KEY, response.refreshToken);
    localStorage.setItem(UUID_KEY, response.uuid);
    localStorage.setItem(NOM_KEY, response.nom);
    localStorage.setItem(TEL_KEY, response.telephone);
    localStorage.setItem(ROLE_KEY, response.role);
  }

  private handleError(error: any) {
    const message = error?.error?.message || error?.error || 'Erreur d\'authentification. Vérifiez vos identifiants.';
    return throwError(() => new Error(typeof message === 'string' ? message : 'Erreur inconnue'));
  }
}
