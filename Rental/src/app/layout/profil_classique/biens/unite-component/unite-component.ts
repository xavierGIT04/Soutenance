import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {BienService} from '../../../../services/bien-service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {StatutUnite, TypeUnite, UniteRequest} from '../dto/request/UniteRequest';
import {UniteResponse} from '../dto/response/UniteResponse';
import {form, FormField, required, submit} from '@angular/forms/signals';
import {NgClass, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-unite-component',
  imports: [
    TitleCasePipe,
    NgClass,
    FormField,
    RouterLink
  ],
  templateUrl: './unite-component.html',
  styleUrl: './unite-component.scss',
})
export class UniteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bienService = inject(BienService); // Remplacez par votre UniteService dédié à terme

  // Rendre les Enums accessibles au template HTML
  protected readonly StatutUnite = StatutUnite;
  protected readonly TypeUnite = TypeUnite;

  // Clé d'identification du Bien Parent récupérée depuis l'URL
  bienUuidParent: string = '';

  // Options pour les menus déroulants
  typeOptions = [
    { value: TypeUnite.Appartement, label: 'Appartement' },
    { value: TypeUnite.Villa, label: 'Villa' },
    { value: TypeUnite.Studio, label: 'Studio' },
    { value: TypeUnite.Boutique, label: 'Boutique' }
  ];

  statutOptions = [
    { value: StatutUnite.Libre, label: 'Libre' },
    { value: StatutUnite.Occupe, label: 'Occupée' },
    { value: StatutUnite.Maintenance, label: 'En Maintenance' }
  ];

  // --- SIGNALS D'ÉTAT ---
  // On dit à Angular que la liste contient des UniteResponse qui peuvent avoir une propriété technique
  listeUnites = signal<UniteResponse[]>([]);
  isModalOpen = signal<boolean>(false);
  uuidUniteEnCours = signal<string | null>(null); // null = Ajout, string = Modif

  // --- FORMULAIRE VIA SIGNALS ---
  uniteModel = signal<UniteRequest>({
    bien_id: '', code_unite: '', description: '', type: TypeUnite.Appartement, statut: StatutUnite.Libre, prix_nuite: '', loyer_reference: ''
  });

  uniteForm = form(this.uniteModel, (filePath) => {
    required(filePath.code_unite, { message: "Le code est obligatoire" });
    required(filePath.type, { message: "Le type est obligatoire" });
    required(filePath.loyer_reference, { message: "Le loyer est obligatoire" });
    required(filePath.statut, { message: "Le statut est obligatoire" });
  });

  ngOnInit(): void {
    // Récupérer l'UUID du bien passé dans l'URL (ex: /proprietes/:uuid/unites)
    this.bienUuidParent = this.route.snapshot.paramMap.get('id') || '';
    this.chargerUnites();
  }

  chargerUnites(): void {
    this.bienService.getUnites(this.bienUuidParent).subscribe({
      next: result => {this.listeUnites.set(result)},
      error: err => {
        console.log(err);
      }
    })
  }

  modifierStatut(uuid: string, nouveauStatut: StatutUnite): void {
    this.bienService.changeStatut(uuid, nouveauStatut).subscribe({
      next: () => {
        this.chargerUnites(); // Recharger la table
      },
      error: (err) => console.error(err)
    });
  }

  chargerPourModification(unite: UniteResponse): void {
    this.uuidUniteEnCours.set(unite.uuid);

    this.uniteModel.set({
      bien_id: this.bienUuidParent,
      code_unite: unite.code_unite,
      description: unite.description || '',
      type: unite.type,
      statut: unite.statut,
      prix_nuite: unite.prix_nuite || '',
      loyer_reference: unite.loyer_reference
    });

    this.isModalOpen.set(true);
  }

  openAddModal(): void {
    this.uuidUniteEnCours.set(null);
    // Initialisation avec l'id du bien parent obligatoire
    this.uniteModel.set({
      bien_id: this.bienUuidParent,
      code_unite: '', description: '', type: TypeUnite.Appartement, statut: StatutUnite.Libre, prix_nuite: '', loyer_reference: ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.uniteForm().reset();
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.uniteForm, async () => {
      const payload = this.uniteModel();
      const uuidUnite = this.uuidUniteEnCours();

      if (uuidUnite) {
        // --- LOGIQUE ENREGISTRER MODIFICATION ---

        this.bienService.updateUnite(payload, uuidUnite).subscribe({
          next: () => {
            this.chargerUnites();
            this.closeModal();
          },
          error: (err) => console.error(err)
        });
      } else {
        // --- LOGIQUE ENREGISTRER AJOUT ---
        this.bienService.addUnite(payload).subscribe({
          next: () => {
            this.chargerUnites();
            this.closeModal();
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  // --- Fonctions utilitaires pour les compteurs du haut ---
  countByStatut(statut: StatutUnite): number {
    return this.listeUnites().filter(u => u.statut === statut).length;
  }


}
