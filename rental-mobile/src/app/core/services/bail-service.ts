import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  BailResponse,
  EcheanceResponse,
  InitPaiementMobileRequest,
  InitPaiementMobileResponse,
  NotificationResponse,
  PaiementResponse,
} from '../models/bail.model';

@Injectable({ providedIn: 'root' })
export class BailService {
  private readonly baseUrl = `${environment.ApiURl}/bail`;
  private http = inject(HttpClient);

  //  Contrats
  /**
   * Contrats du locataire connecté.
   * GET /api/bail/mes_contrats
   */
  mesContrats(): Observable<BailResponse[]> {
    return this.http.get<BailResponse[]>(`${this.baseUrl}/mes_contrats`);
  }

  //  Échéances
  /**
   * Échéances d'un contrat donné.
   * GET /api/bail/echeances/{contratUuid}
   */
  getEcheancesByContrat(contratUuid: string): Observable<EcheanceResponse[]> {
    return this.http.get<EcheanceResponse[]>(`${this.baseUrl}/echeances/${contratUuid}`);
  }

  // Paiements
  /**
   * Historique des paiements d'une échéance.
   * GET /api/bail/paiements/{echeanceUuid}
   */
  getPaiementsByEcheance(echeanceUuid: string): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${this.baseUrl}/paiements/${echeanceUuid}`);
  }

  //  Paiement Mobile Money (FedaPay)
  /**
   * Initie un paiement Mobile Money (Flooz/TMoney).
   * POST /api/bail/initier_paiement_mobile
   */
  initierPaiementMobile(request: InitPaiementMobileRequest): Observable<InitPaiementMobileResponse> {
    return this.http.post<InitPaiementMobileResponse>(`${this.baseUrl}/initier_paiement_mobile`, request);
  }

  //  Notifications
  /**
   * Notifications non lues du locataire connecté.
   * GET /api/bail/notifications/non-lues
   */
  getNotificationsNonLues(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.baseUrl}/notifications/non-lues`);
  }

  /**
   * Marquer une notification comme lue.
   * PATCH /api/bail/notifications/{notifUuid}/lire
   */
  marquerNotificationLue(notifUuid: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.baseUrl}/notifications/${notifUuid}/lire`, {});
  }
}
