import {ModePaiement} from '../request/PaiementRequest';

export interface PaiementResponse {
  uuid: string;
  datePaiement: Date;
  montant:string,
  modePaiement:ModePaiement,
  referencePaiement:string,
  recuUrl:string
}
