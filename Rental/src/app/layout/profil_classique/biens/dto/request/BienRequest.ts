export interface BienRequest {
  libelle: string;
  type: BienEnum;
  ville: string;
  quartier: string;
}

export enum BienEnum {
  Immeuble = "IMMEUBLE",
  Cour_Commune = "COUR_COMMUNE",
  Villa = "VILLA"
}
