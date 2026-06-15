import {TypeUnite} from '../../../biens/dto/request/UniteRequest';

export interface BailResponse {
  uuid: string;
  locataireNom: string;
  locataireTelephone: string;
  codeUnite:string,
  typeUnite:TypeUnite,
  dateDebut:Date;
  dateSortie:Date,
  loyer:string,
  statut:BailEnum,
  jourEcheance:number,
  duree:number,
  condition:string
}

export enum BailEnum {
  Actif="ACTIF", Resiliation="EN_COURS_DE_RESILIATION", Termine="TERMINE",
}
