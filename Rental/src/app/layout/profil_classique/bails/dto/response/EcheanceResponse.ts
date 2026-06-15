export interface EcheanceResponse {
  uuid: string;
  dateEcheance:Date,
  montantDu:string,
  montantRestant:string,
  statut:StatutEcheance,
  codeUnite:string
}

export enum StatutEcheance {
  Attente="EN_ATTENTE", Partiellement_Paye="PARTIELLEMENT_PAYE", Paye="PAYE", Retard="EN_RETARD"
}
