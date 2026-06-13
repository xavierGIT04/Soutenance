import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {BienEnum, BienRequest} from "../dto/request/BienRequest";
import {TitleCasePipe} from '@angular/common';
import {BienService} from '../../../../services/bien-service';
import {BienResponse} from '../dto/response/BienResponse';
import {Router, RouterLink} from '@angular/router';
import {form, FormField, required, submit} from '@angular/forms/signals';
import {reportUnhandledError} from 'rxjs/internal/util/reportUnhandledError';

@Component({
  selector: 'app-liste-component',
  imports: [
    TitleCasePipe,
    FormField,
    RouterLink
  ],
  templateUrl: './liste-component.html',
  styleUrl: './liste-component.scss',
})
export class ListeComponent  implements OnInit {

  protected readonly BienEnum = BienEnum;
  private bienService = inject(BienService);
  private route = inject(Router);

  bienOptions = [
    { value: BienEnum.Immeuble, label: 'Immeuble' },
    { value: BienEnum.Cour_Commune, label: 'Cour Commune' },
  ];

  // --- SIGNALS D'ÉTAT ---
  listeBiens = signal<BienResponse[]>([]);
  isModalOpen = signal<boolean>(false);
  bienEnCoursDeModificationUuid = signal<string | null>(null); // null = Ajout, string = Modification

  // --- SIGNALS POUR LES FILTRES ---
  rechercheLibelle = signal<string>('');
  rechercheVille = signal<string>('');
  filtreType = signal<string>('');

  // --- FILTRAGE DYNAMIQUE  ---
  // Ce signal calculé va filtrer automatiquement la liste dès qu'un filtre change
  biensFiltres = computed(() => {
    return this.listeBiens().filter(bien => {
      const matchLibelle = bien.libelle.toLowerCase().includes(this.rechercheLibelle().toLowerCase());
      const matchVille = bien.ville.toLowerCase().includes(this.rechercheVille().toLowerCase());
      const matchType = this.filtreType() === '' || bien.type === this.filtreType();
      return matchLibelle && matchVille && matchType;
    });
  });

  // --- GESTION DU FORMULAIRE ---
  bienModel = signal<BienRequest>({
    libelle: '', quartier: '', type: BienEnum.Immeuble, ville: ''
  });

  bienForm = form(this.bienModel, (filePath) => {
    required(filePath.libelle, { message: "Champ obligatoire" });
    required(filePath.quartier, { message: "Champ obligatoire" });
    required(filePath.type, { message: "Champ obligatoire" });
    required(filePath.ville, { message: "Champ obligatoire" });
  });

  ngOnInit(): void {
    this.chargerBiens();
  }

  chargerBiens(): void {
    this.bienService.allBien().subscribe({
      next: (result) => this.listeBiens.set(result),
      error: err => console.error(err)
    });
  }

  voirUnites(uuid: string): void {
    this.route.navigate(['/dashboard/classic/proprietes', uuid, 'unites']);
  }

  // --- ACTION MODIFICATION ---
  modifierBien(bien: BienResponse): void {
    // 1. On stocke l'UUID pour savoir qu'on est en mode "Edition"
    this.bienEnCoursDeModificationUuid.set(bien.uuid);

    // 2. On injecte les valeurs du bien actuel dans le modèle du formulaire
    this.bienModel.set({
      libelle: bien.libelle,
      quartier: bien.quartier,
      type: bien.type,
      ville: bien.ville,
    });

    // 3. On ouvre le modal pour que l'utilisateur modifie les champs
    this.isModalOpen.set(true);
  }

  openAddModal(): void {
    this.bienEnCoursDeModificationUuid.set(null); // Mode "Ajout"
    this.bienModel.set({ libelle: '', quartier: '', type: BienEnum.Immeuble, ville: '' });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.bienForm().reset();
  }

  // --- SOUMISSION UNIQUE ---
  onSubmit(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.bienForm, async () => {
      const payload = this.bienModel();
      const uuidEnCours = this.bienEnCoursDeModificationUuid();

      if (uuidEnCours) {
        // --- MODE EDITION ---
        this.bienService.updateBien(payload, uuidEnCours).subscribe({
          next: () => {
            this.chargerBiens();
            this.closeModal(); // Ferme et réinitialise APRES le succès
          },
          error: err => console.error(err)
        });
      } else {
        // --- MODE AJOUT ---
        this.bienService.addBien(payload).subscribe({
          next: () => {
            this.chargerBiens();
            this.closeModal(); // Ferme et réinitialise APRES le succès
          },
          error: err => console.error(err)
        });
      }
    });
  }
}
