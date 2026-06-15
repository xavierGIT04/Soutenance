export interface PaiementRequest {
  echeanceUuid: string;
  montant:string;
  modePaiement:ModePaiement;
  referencePaiement:String;
}

export enum ModePaiement{
  Espece = "ESPECES", Moble_Money="MOBILE_MONEY",
}
