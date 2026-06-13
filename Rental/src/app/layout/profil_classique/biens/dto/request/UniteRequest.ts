import {BienEnum} from './BienRequest';

export interface UniteRequest {
  bien_id: string;
  code_unite:string;
  description: string;
  type:TypeUnite;
  statut:StatutUnite;
  prix_nuite:string;
  loyer_reference:string;
}


export enum TypeUnite {
  Appartement = "APPARTEMENT",
  Villa = "VILLA",
  Studio = "STUDIO",
  Boutique = "BOUTIQUE",
}


export enum StatutUnite {
  Occupe = "OCCUPEE",
  Libre = "LIBRE",
  Maintenance = "MAINTENANCE",
}
