export enum RoleEnum {
  ADMIN = 'ADMIN',
  LOCATAIRE = 'LOCATAIRE',
  PROPRIETAIRE = 'PROPRIETAIRE',
}

export enum ProfilEnum {
  classique = 'LOCATION_CLASSIQUE',
  airbn = 'LOCATION_SEJOUR',
  user = 'USER',
}

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
  tokenType?: string;
}

export interface UtilisateurResponse {
  uuid: string;
  telephone: string;
  profil: ProfilEnum;
  role: RoleEnum;
  nom: string;
  avatar: string | null;
}

export interface UpdateInfosRequest {
  nom: string;
  telephone: string;
  code: string;
}
