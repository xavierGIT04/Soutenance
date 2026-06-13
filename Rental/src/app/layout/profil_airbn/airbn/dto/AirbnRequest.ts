import {StatutUnite, TypeUnite} from '../../../profil_classique/biens/dto/request/UniteRequest';
import {BienEnum} from '../../../profil_classique/biens/dto/request/BienRequest';

export interface AirbnRequest {
  libelle: string;
  typebien: BienEnum.Villa;
  description: string;
  typeUnite:TypeUnite.Villa;
  statut:StatutUnite;
  prix_nuite:string;
  ville: string;
  quartier: string;
}
