export interface BailRequest {
   locataireUuid:string;
   uniteUuid: string;
   dateDebut: Date;
   dateSortie: Date|null;
   loyer:string;
   jourEcheance:string;
   conditions:string
}
