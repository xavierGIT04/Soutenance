import {BienEnum} from '../request/BienRequest';

export interface BienResponse {
  uuid: string;
  proprietaire_name:string;
  libelle:string;
  type:BienEnum;
  ville:string;
  quartier:string;
}
