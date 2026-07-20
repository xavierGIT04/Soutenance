import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment.development';
import {
  DashboardFiltre,
  DashboardProfilAResponse
} from '../layout/profil_classique/dashboard/dto/response/DashboardResponse';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private readonly baseUrl = `${environment.ApiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Indicateurs du dashboard Profil A (Module A5).
   * GET /api/dashboard/profil-a?bienUuid=&uniteUuid=&annee=&mois=
   * Rôle requis : PROPRIETAIRE
   */
  getDashboardProfilA(filtre: DashboardFiltre = {}): Observable<DashboardProfilAResponse> {
    let params = new HttpParams();

    if (filtre.bienUuid) params = params.set('bienUuid', filtre.bienUuid);
    if (filtre.uniteUuid) params = params.set('uniteUuid', filtre.uniteUuid);
    if (filtre.annee) params = params.set('annee', filtre.annee);
    if (filtre.mois) params = params.set('mois', filtre.mois);

    return this.http.get<DashboardProfilAResponse>(`${this.baseUrl}/profil-a`, {params});
  }
}
