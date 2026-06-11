export enum PROFIL {
  classique = "LOCATION_CLASSIQUE",
  airbn = "LOCATION_SEJOUR",

}
export enum ROLE {
  Admin = "ADMIN",
  Propritaire = "PROPRIETAIRE",
  Locataire = "LOCATAIRE",


}

export interface UserRequest {
  nom: string;
  telephone: string;
  code: string;
  profil: PROFIL;
  role: ROLE;

}
