import {StatutUnite, TypeUnite} from '../request/UniteRequest';

export interface UniteResponse {
  uuid: string;
  bien_name: string;
  code_unite:string;
  description: string;
  type:TypeUnite;
  statut:StatutUnite;
  loyer_reference:string;
  prix_nuite:string;
}
