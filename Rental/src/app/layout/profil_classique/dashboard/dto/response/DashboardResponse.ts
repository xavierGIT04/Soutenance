import {StatutEcheance} from '../../../bails/dto/response/EcheanceResponse';

export interface ImpayeResponse {
  contratUuid: string;
  echeanceUuid: string;
  locataireNom: string;
  locataireTelephone: string;
  codeUnite: string;
  dateEcheance: Date;
  montantRestant: string;
  statut: StatutEcheance;
  joursDeRetard: number;
}

export interface DashboardProfilAResponse {
  annee: number;
  mois: number | null;
  bienUuid: string | null;
  uniteUuid: string | null;

  totalUnites: number;
  unitesOccupees: number;
  unitesLibres: number;
  unitesMaintenance: number;
  tauxOccupation: number;

  revenuAttendu: string;
  revenuEncaisse: string;
  montantImpaye: string;

  nombreImpayes: number;
  impayes: ImpayeResponse[];
}

/**
 * Filtres dynamiques envoyés au backend
 */
export interface DashboardFiltre {
  bienUuid?: string;
  uniteUuid?: string;
  annee?: number;
  mois?: number;
}
