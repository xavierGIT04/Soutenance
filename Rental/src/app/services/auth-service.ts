import {Injectable, signal} from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {PROFIL, ROLE, UserRequest} from '../layout/authentification/dto/request/UserRequest';
import {UserResponse} from '../layout/authentification/dto/response/UserResponse';
import {AuthRequest} from '../layout/authentification/dto/request/AuthRequest';
import {UserInfo} from '../layout/authentification/dto/response/UserInfo';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly apiUrl: string = `${environment.ApiUrl}/auth/`;
  currentUserProfil = signal<string | null>(localStorage.getItem('user_profil'));

  constructor(private http: HttpClient, private router:Router) {}

  register(data:UserRequest):Observable<UserResponse>{
    return this.http.post<UserResponse>(`${this.apiUrl}register`, data)
      .pipe(
        tap(res => {
          this.storeAuthData(res);
          this.router.navigate(['/login']);
        }),
        catchError(this.handleError)
      )
  }

  login(credentials:AuthRequest):Observable<UserResponse>{
    return this.http.post<UserResponse>(`${this.apiUrl}login`, credentials)
      .pipe(
        tap(res => {
          this.storeAuthData(res);
          const profil = res.profil;
          this.currentUserProfil.set(profil);

          if(profil === PROFIL.classique){
            this.router.navigate(['/dashboard/classic']);
          }
          else if(profil === PROFIL.airbn){
            this.router.navigate(['/dashboard/airbn']);
          }

        }),
        catchError(this.handleError)
      )
  }

  refreshToken():Observable<{ token: string, expiresIn:string }>{

    const refreshToken = localStorage.getItem('refreshToken');

    if(!refreshToken){
      this.logout();
      return throwError(() => new Error('Pas de refresh token'));
    }

    return this.http.post<{ token: string, expiresIn:string }>(`${this.apiUrl}refresh`, {refreshToken})
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          // Refresh token expiré : déconnexion forcée
          this.logout();
          return throwError(() => error);
        })
      )
  }

  getMe():Observable<UserInfo>{
    return this.http.get<UserInfo>(`${this.apiUrl}me`);
  }

  updateAvatar(avatar:String):Observable<UserInfo>{
    return this.http.put<UserInfo>(`${this.apiUrl}update_avatar`, avatar);
  }

  updateInfos(_object:{code: string,nom:string,telephone:string,profil:PROFIL | undefined, role:ROLE }):Observable<UserInfo>{
      const data = {code:_object.code, telephone:_object.telephone, nom:_object.nom}
      return this.http.put<UserInfo>(`${this.apiUrl}update_info`, data)
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_profil');
    localStorage.removeItem('user_uuid');
    localStorage.removeItem('nom');
    localStorage.removeItem('telephone');
    localStorage.removeItem('role');
    console.log('🗑️ Tokens supprimés, navigation...');
    this.router.navigate(['/login']).then(success => {
      console.log('Navigation réussie ?', success); // false = bloquée par une guard
    });
  }




  // ===== MÉTHODES UTILITAIRES =====

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    // Vérifier que le token n'est pas expiré
    return !this.isTokenExpired(token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Stocker les données après login/register
  private storeAuthData(response: UserResponse): void {
    localStorage.setItem('token',  response.token);
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user_profil', response.profil);
    localStorage.setItem('user_uuid', response.uuid);
    localStorage.setItem('nom', response.nom);
    localStorage.setItem('telephone', response.telephone);
    localStorage.setItem('role', response.role);
  }

  // Décoder le token JWT pour lire la date d'expiration (sans vérifier la signature)
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp est en secondes (Unix timestamp)
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // Token malformé → considéré expiré
    }
  }

  private handleError(error: any): Observable<never> {
    const message = error.error?.message || 'Erreur d\'authentification';
    return throwError(() => new Error(message));
  }


}
