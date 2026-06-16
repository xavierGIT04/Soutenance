export enum BailEnum {
  Actif = 'ACTIF',
  Resiliation = 'EN_COURS_DE_RESILIATION',
  Termine = 'TERMINE',
}

export enum TypeUnite {
  Appartement = 'APPARTEMENT',
  Villa = 'VILLA',
  Studio = 'STUDIO',
  Boutique = 'BOUTIQUE',
}

export enum StatutEcheance {
  Attente = 'EN_ATTENTE',
  PartiellementPaye = 'PARTIELLEMENT_PAYE',
  Paye = 'PAYE',
  Retard = 'EN_RETARD',
}

export enum ModePaiement {
  Espece = 'ESPECES',
  MobileMoney = 'MOBILE_MONEY',
}

export enum TypeNotification {
  RelanceLoyer = 'RELANCE_LOYER',
  ConfirmationPaiement = 'CONFIRMATION_PAIEMENT',
  AlerteRetard = 'ALERTE_RETARD',
  Info = 'INFO',
}

export interface BailResponse {
  uuid: string;
  locataireNom: string;
  locataireTelephone: string;
  codeUnite: string;
  typeUnite: TypeUnite;
  dateDebut: string;
  dateSortie: string | null;
  loyer: string;
  statut: BailEnum;
  jourEcheance: number;
  duree: number | null;
  condition: string | null;
}

export interface EcheanceResponse {
  uuid: string;
  dateEcheance: string;
  montantDu: string;
  montantRestant: string;
  statut: StatutEcheance;
  codeUnite: string;
}

export interface PaiementResponse {
  uuid: string;
  datePaiement: string;
  montant: string;
  modePaiement: string;
  referencePaiement: string;
  recuUrl: string | null;
}

export interface NotificationResponse {
  uuid: string;
  titre: string;
  message: string;
  dateEnvoi: string;
  typeNotification: TypeNotification;
  estLu: boolean;
}

export interface InitPaiementMobileRequest {
  echeanceUuid: string;
  telephone?: string;
}

export interface InitPaiementMobileResponse {
  echeanceUuid: string;
  montant: string;
  paymentUrl: string;
  message: string;
}
