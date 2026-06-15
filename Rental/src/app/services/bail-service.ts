import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {PaiementResponse} from '../layout/profil_classique/bails/dto/response/PaiementResponse';
import {PaiementRequest} from '../layout/profil_classique/bails/dto/request/PaiementRequest';
import {EcheanceRequest} from '../layout/profil_classique/bails/dto/request/EcheanceRequest';
import {EcheanceResponse} from '../layout/profil_classique/bails/dto/response/EcheanceResponse';
import {BailResponse} from '../layout/profil_classique/bails/dto/response/BailResponse';
import {BailRequest} from '../layout/profil_classique/bails/dto/request/BailRequest';
import {UserResponse} from '@supabase/supabase-js';
import {UserRequest} from '../layout/authentification/dto/request/UserRequest';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.development';
import {UserInfo} from '../layout/authentification/dto/response/UserInfo';
import {UniteResponse} from '../layout/profil_classique/biens/dto/response/UniteResponse';

@Injectable({
  providedIn: 'root',
})
export class BailService {

  private readonly baseUrl = `${environment.ApiUrl}/bail`;

  constructor(private http: HttpClient) {}

  //  Locataires

  /**
   * Crée un nouveau locataire.
   * POST /api/bail/add_locataire
   * Rôle requis : PROPRIETAIRE
   */
  addLocataire(request: UserRequest): Observable<UserInfo> {
    return this.http.post<UserInfo>(
      `${this.baseUrl}/add_locataire`,
      request
    );
  }

  /**
   * Récupère la liste des locataires créés par le propriétaire connecté.
   * GET /api/bail/mes_locataires
   * Rôle requis : PROPRIETAIRE
   */
  mesLocataires(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(
      `${this.baseUrl}/mes_locataires`
    );
  }

  unitesLibres(): Observable<UniteResponse[]> {
    return this.http.get<UniteResponse[]>(
      `${this.baseUrl}/unite_libre`
    );
  }

  //  Contrats

  /**
   * Crée un nouveau contrat de bail.
   * POST /api/bail/add
   * Rôle requis : PROPRIETAIRE
   */
  creerContrat(request: BailRequest): Observable<BailResponse> {
    return this.http.post<BailResponse>(
      `${this.baseUrl}/add`,
      request
    );
  }

  mesContrat(): Observable<BailResponse[]> {
    return this.http.get<BailResponse[]>(
      `${this.baseUrl}/proprio_contrats`);
  }
  /**
   * Résilie un contrat de bail existant.
   * PATCH /api/bail/resilier/{contratUuid}
   * Rôle requis : PROPRIETAIRE
   */
  resilierContrat(contratUuid: string): Observable<BailResponse> {
    return this.http.patch<BailResponse>(
      `${this.baseUrl}/resilier/${contratUuid}`,
      {}
    );
  }

  // ─── Échéances ───────────────────────────────────────────────────────────────

  /**
   * Récupère les échéances d'un contrat donné.
   * GET /api/bail/echeances/{contratUuid}
   * Rôle requis : PROPRIETAIRE ou LOCATAIRE
   */
  getEcheancesByContrat(contratUuid: string): Observable<EcheanceResponse[]> {
    return this.http.get<EcheanceResponse[]>(
      `${this.baseUrl}/echeances/${contratUuid}`
    );
  }

  /**
   * Récupère toutes les échéances en retard.
   * GET /api/bail/echeances_retard
   * Rôle requis : PROPRIETAIRE
   */
  getEcheancesEnRetard(): Observable<EcheanceResponse[]> {
    return this.http.get<EcheanceResponse[]>(
      `${this.baseUrl}/echeances_retard`
    );
  }

  /**
   * Crée une nouvelle échéance manuellement.
   * POST /api/bail/echeances/
   * Rôle requis : PROPRIETAIRE
   */
  addEcheance(request: EcheanceRequest): Observable<EcheanceResponse> {
    return this.http.post<EcheanceResponse>(
      `${this.baseUrl}/echeances/`,
      request
    );
  }

  // ─── Paiements ───────────────────────────────────────────────────────────────

  /**
   * Enregistre un paiement manuellement (espèces, virement, etc.).
   * POST /api/bail/paiement
   * Rôle requis : PROPRIETAIRE
   */
  enregistrerPaiement(request: PaiementRequest): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(
      `${this.baseUrl}/paiement`,
      request
    );
  }

  /**
   * Récupère la liste des paiements liés à une échéance.
   * GET /api/bail/paiements/{echeanceUuid}
   * Rôle requis : PROPRIETAIRE ou LOCATAIRE
   */
  getPaiementsByEcheance(echeanceUuid: string): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(
      `${this.baseUrl}/paiements/${echeanceUuid}`
    );
  }

}
