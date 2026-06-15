import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BailResponse,
  EcheanceResponse,
  PaiementResponse,
  NotificationResponse,
  InitPaiementMobileRequest,
  InitPaiementMobileResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class BailService {
  private apiUrl = `${environment.apiUrl}/bail`;

  private http = inject(HttpClient)

  // ─── Contrats ─────────────────────────────────────────────────────────────

  mesContrats(): Observable<BailResponse[]> {
    return this.http.get<BailResponse[]>(`${this.apiUrl}/mes_contrats`);
  }

  // ─── Échéances ────────────────────────────────────────────────────────────

  getEcheancesByContrat(contratUuid: string): Observable<EcheanceResponse[]> {
    return this.http.get<EcheanceResponse[]>(`${this.apiUrl}/echeances/${contratUuid}`);
  }

  // ─── Paiements ────────────────────────────────────────────────────────────

  getPaiementsByEcheance(echeanceUuid: string): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${this.apiUrl}/paiements/${echeanceUuid}`);
  }

  initierPaiementMobile(request: InitPaiementMobileRequest): Observable<InitPaiementMobileResponse> {
    return this.http.post<InitPaiementMobileResponse>(
      `${this.apiUrl}/initier_paiement_mobile`,
      request
    );
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  getNotificationsNonLues(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/notifications/non-lues`);
  }

  marquerNotifLue(notifUuid: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(
      `${this.apiUrl}/notifications/${notifUuid}/lire`,
      {}
    );
  }
}
