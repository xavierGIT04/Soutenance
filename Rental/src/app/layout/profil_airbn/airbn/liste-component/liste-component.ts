import {Component, inject, OnInit, signal} from '@angular/core';
import {AirbnService} from '../../../../services/airbn-service';
import {StatutUnite, TypeUnite} from '../../../profil_classique/biens/dto/request/UniteRequest';
import {AirbnResponse} from '../dto/AirbnResponse';
import {AirbnRequest} from '../dto/AirbnRequest';
import {form, FormField, required, submit} from '@angular/forms/signals';
import {HttpParams} from '@angular/common/http';
import {BienEnum} from '../../../profil_classique/biens/dto/request/BienRequest';
import {DecimalPipe, NgClass, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-liste-component',
  imports: [
    FormField,
    NgClass,
    RouterLink,
    DecimalPipe,
  ],
  templateUrl: './liste-component.html',
  styleUrl: './liste-component.scss',
})
export class ListeComponent implements OnInit {

  private airbnService = inject(AirbnService);
  isOpen = false;
  // Rendre l'échantillon accessible au template HTML
  protected readonly StatutUnite = StatutUnite;

  statutOptions = [
    { value: StatutUnite.Libre, label: 'Libre (Disponible)' },
    { value: StatutUnite.Occupe, label: 'Occupé' },
    { value: StatutUnite.Maintenance, label: 'En Maintenance' }
  ];

  listeAirbns = signal<AirbnResponse[]>([]);
  isModalOpen = signal<boolean>(false);
  uuidBienEnCours = signal<string | null>(null); // Pour traquer le mode Modification (Contient uuidBien)

  // Remplacez 'BienEnum.Villa' et 'TypeUnite.Villa' par leurs vraies valeurs d'Enum string (Ex: 'VILLA')
  private readonly DEFAULT_BIEN_TYPE = BienEnum.Villa as any;
  private readonly DEFAULT_UNITE_TYPE = TypeUnite.Villa as any;

  // --- MODÈLE INITIAL FORMULAIRE ---
  airbnbModel = signal<AirbnRequest>({
    libelle: '',
    typebien: this.DEFAULT_BIEN_TYPE,
    description: '',
    typeUnite: this.DEFAULT_UNITE_TYPE,
    statut: StatutUnite.Libre,
    prix_nuite: '',
    ville: '',
    quartier: ''
  });

  airbnbForm = form(this.airbnbModel, (rules) => {
    required(rules.libelle, { message: "Le libellé est obligatoire" });
    required(rules.ville, { message: "La ville est obligatoire" });
    required(rules.quartier, { message: "Le quartier est obligatoire" });
    required(rules.prix_nuite, { message: "Le prix de la nuité est obligatoire" });
    required(rules.statut, { message: "Le statut est requis" });
  });

  ngOnInit(): void {
    this.chargerAirbnb();
  }

  chargerAirbnb(): void {
    this.airbnService.all_airbn().subscribe({
      next: (res) => this.listeAirbns.set(res),
      error: (err) => console.error("Erreur chargement Airbnb :", err)
    });
  }

  // Modification rapide du statut de l'unité dépendante
  modifierStatut(uuid: string, nouveauStatut: StatutUnite): void {
    this.airbnService.changer_statut(uuid, nouveauStatut).subscribe({
      next: () => this.chargerAirbnb(),
      error: (err) => console.error("Erreur mise à jour statut Airbnb :", err)
    });
  }

  chargerPourModification(airbn: AirbnResponse): void {
    this.uuidBienEnCours.set(airbn.uuidBien);

    this.airbnbModel.set({
      libelle: airbn.libelle,
      typebien: airbn.typebien,
      description: airbn.description || '',
      typeUnite: airbn.typeUnite,
      statut: airbn.statut,
      prix_nuite: airbn.prix_nuite,
      ville: airbn.ville,
      quartier: airbn.quartier
    });

    this.isModalOpen.set(true);
  }

  openAddModal(): void {
    this.uuidBienEnCours.set(null);
    this.airbnbModel.set({
      libelle: '',
      typebien: this.DEFAULT_BIEN_TYPE,
      description: '',
      typeUnite: this.DEFAULT_UNITE_TYPE,
      statut: StatutUnite.Libre,
      prix_nuite: '',
      ville: '',
      quartier: ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.airbnbForm().reset();
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.airbnbForm, async () => {
      const payload = this.airbnbModel();
      const uuidBien = this.uuidBienEnCours();

      if (uuidBien) {
        // --- MODE UPDATE ---
        const params = new HttpParams().set('id', uuidBien);
        this.airbnService.update(payload, uuidBien).subscribe({
          next: () => {
            this.chargerAirbnb();
            this.closeModal();
          },
          error: (err) => console.error("Erreur lors de l'update :", err)
        });
      } else {
        // --- MODE ADD ---
        this.airbnService.add_airbn(payload).subscribe({
          next: () => {
            this.chargerAirbnb();
            this.closeModal();
          },
          error: (err) => console.error("Erreur lors de l'ajout :", err)
        });
      }
    });
  }

  // Signal pour le modal de détail
  airbnDetail = signal<AirbnResponse | null>(null);

  ouvrirDetail(airbn: AirbnResponse) {
    this.airbnDetail.set(airbn);
  }

  fermerDetail() {
    this.airbnDetail.set(null);
  }
}
