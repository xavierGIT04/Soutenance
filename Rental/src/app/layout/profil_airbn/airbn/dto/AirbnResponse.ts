import {BienEnum} from '../../../profil_classique/biens/dto/request/BienRequest';
import {StatutUnite, TypeUnite} from '../../../profil_classique/biens/dto/request/UniteRequest';

export interface AirbnResponse {
  uuidBien:string;
  uuidUnite: string
  libelle: string;
  typebien: BienEnum.Villa;
  description: string;
  typeUnite:TypeUnite.Villa;
  statut:StatutUnite;
  prix_nuite:string;
  ville: string;
  quartier: string;
}
