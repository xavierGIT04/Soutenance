// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthRequest {
  telephone: string;
  codeProprietaire: string;
}

export interface AuthResponse {
  uuid: string;
  token: string;
  refreshToken: string;
  role: RoleEnum;
  profil: ProfilEnum;
  nom: string;
  telephone: string;
}

export interface UtilisateurResponse {
  uuid: string;
  telephone: string;
  profil: ProfilEnum;
  role: RoleEnum;
  nom: string;
  avatar: string;
}

export interface UpdateInfoRequest {
  nom: string;
  telephone: string;
  code: string;
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  LOCATAIRE = 'LOCATAIRE',
  PROPRIETAIRE = 'PROPRIETAIRE'
}

export enum ProfilEnum {
  LOCATION_CLASSIQUE = 'LOCATION_CLASSIQUE',
  LOCATION_SEJOUR = 'LOCATION_SEJOUR',
  USER = 'USER'
}

// ─── Bail / Contrat ───────────────────────────────────────────────────────────

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
  condition: string;
}

export enum BailEnum {
  ACTIF = 'ACTIF',
  EN_COURS_DE_RESILIATION = 'EN_COURS_DE_RESILIATION',
  TERMINE = 'TERMINE'
}

export enum TypeUnite {
  APPARTEMENT = 'APPARTEMENT',
  VILLA = 'VILLA',
  STUDIO = 'STUDIO',
  BOUTIQUE = 'BOUTIQUE'
}

// ─── Échéances ────────────────────────────────────────────────────────────────

export interface EcheanceResponse {
  uuid: string;
  dateEcheance: string;
  montantDu: string;
  montantRestant: string;
  statut: StatutEcheance;
  codeUnite: string;
}

export enum StatutEcheance {
  EN_ATTENTE = 'EN_ATTENTE',
  PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
  PAYE = 'PAYE',
  EN_RETARD = 'EN_RETARD'
}

// ─── Paiements ────────────────────────────────────────────────────────────────

export interface PaiementResponse {
  uuid: string;
  datePaiement: string;
  montant: string;
  modePaiement: string;
  referencePaiement: string;
  recuUrl: string | null;
}

export interface InitPaiementMobileRequest {
  echeanceUuid: string;
  telephone: string;
}

export interface InitPaiementMobileResponse {
  echeanceUuid: string;
  montant: number;
  paymentUrl: string;
  message: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  uuid: string;
  titre: string;
  message: string;
  dateEnvoi: string;
  typeNotification: TypeNotification;
  estLu: boolean;
}

export enum TypeNotification {
  RELANCE_LOYER = 'RELANCE_LOYER',
  CONFIRMATION_PAIEMENT = 'CONFIRMATION_PAIEMENT',
  ALERTE_RETARD = 'ALERTE_RETARD',
  INFO = 'INFO'
}
