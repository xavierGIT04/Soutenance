import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, UtilisateurResponse } from '../models';

const TOKEN_KEY = 'rental_token';
const REFRESH_KEY = 'rental_refresh';
const USER_KEY = 'rental_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private _currentUser = new BehaviorSubject<UtilisateurResponse | null>(this.loadUser());

  currentUser$ = this._currentUser.asObservable();

  private http = inject(HttpClient)

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.storeSession(res))
    );
  }

  getMe(): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.next(user);
      })
    );
  }

  updateInfo(infos: { nom: string; telephone: string; code: string }): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}/update_info`, infos).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.next(user);
      })
    );
  }

  updateAvatar(url: string): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}/update_avatar`, url).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.next(user);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string; expiresIn: number }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string; expiresIn: number }>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(res => localStorage.setItem(TOKEN_KEY, res.accessToken))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  get currentUser(): UtilisateurResponse | null {
    return this._currentUser.value;
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    const user: UtilisateurResponse = {
      uuid: res.uuid,
      telephone: res.telephone,
      profil: res.profil,
      role: res.role,
      nom: res.nom,
      avatar: ''
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.next(user);
  }

  private loadUser(): UtilisateurResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
