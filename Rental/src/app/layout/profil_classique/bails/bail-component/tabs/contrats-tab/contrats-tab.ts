import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {BailService} from '../../../../../../services/bail-service';
import {BailEnum, BailResponse} from '../../../dto/response/BailResponse';
import {BailRequest} from '../../../dto/request/BailRequest';
import {form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {DatePipe, DecimalPipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-contrats-tab',
  imports: [
    FormField,
    NgClass,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './contrats-tab.html',
  styleUrl: './contrats-tab.scss',
})
export class ContratsTab implements OnInit {

  private bailService = inject(BailService);

  // États des listes
  readonly contrats = signal<BailResponse[]>([]);
  readonly locataires = signal<any[]>([]); // Contiendra la liste brute des locataires disponibles
  readonly unitesLibres = signal<any[]>([]); // Liste des unités disponibles (Statut LIBRE)
  readonly loading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly joursDuMois = Array.from({ length: 31 }, (_, i) => i + 1);

  // Filtrage réactif
  readonly filteredContrats = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.contrats();
    return this.contrats().filter(
      (c) =>
        c.locataireNom?.toLowerCase().includes(term) ||
        c.codeUnite?.toLowerCase().includes(term) ||
        c.statut?.toLowerCase().includes(term)
    );
  });


  readonly showCreateModal = signal<boolean>(false);
  readonly createLoading = signal<boolean>(false);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);

  //  Modèle réactif Signal Forms pour la création
  readonly bailModel = signal<BailRequest>({
    locataireUuid: '',
    uniteUuid: '',
    dateDebut: new Date(),
    dateSortie: null,
    loyer: '',
    jourEcheance: '',
    conditions: ''
  });

  // Liaison du validateur Signal Forms
  readonly creationForm = form(this.bailModel, (check) => {
    required(check.locataireUuid, { message: 'Veuillez choisir un locataire.' });
    required(check.uniteUuid, { message: 'Veuillez assigner une unité.' });
    required(check.dateDebut, { message: 'La date de prise d\'effet est obligatoire.' });
    required(check.loyer, { message: 'Le montant du loyer mensuel est obligatoire.' });
    required(check.jourEcheance, { message: 'Le jour d\'échéance est obligatoire.' });
  });

  // État modal résiliation
  readonly showResilierModal = signal<boolean>(false);
  readonly resilierLoading = signal<boolean>(false);
  readonly resilierError = signal<string | null>(null);
  readonly selectedContrat = signal<BailResponse | null>(null);

  ngOnInit(): void {
    this.loadContrats();
    this.loadLocataires();
    this.loadUnitesLibres();
  }

  //  Chargements

  loadContrats(): void {
    this.loading.set(true);
    this.bailService.mesContrat().subscribe({
      next: (data) => {
        this.contrats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadLocataires(): void {
    this.bailService.mesLocataires().subscribe({
      next: (data) => this.locataires.set(data)
    });
  }

  loadUnitesLibres(): void {
    this.bailService.unitesLibres().subscribe({
      next: (data) => this.unitesLibres.set(data)
    });
  }

  onUniteChange(uuid: string): void {
    const uniteSelected = this.unitesLibres().find(u => u.uuid === uuid);
    if (uniteSelected) {
      this.bailModel.update(m => ({ ...m, loyer: uniteSelected.loyer_reference.toString() }));
    }
  }

  //  Actions Modal Création

  openCreateModal(): void {
    this.createError.set(null);
    this.createSuccess.set(null);

    this.bailModel.set({
      locataireUuid: '',
      uniteUuid: '',
      dateDebut: new Date(),
      dateSortie: new Date(),
      loyer: '',
      jourEcheance: '',
      conditions: ''
    });

    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.creationForm().reset();
  }

  submitCreate(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.creationForm, async () => {
      this.createLoading.set(true);
      this.createError.set(null);

      this.bailService.creerContrat(this.bailModel()).subscribe({
        next: (contrat) => {
          this.contrats.update((list) => [contrat, ...list]);
          this.createLoading.set(false);
          this.createSuccess.set('Contrat de bail créé et validé avec succès.');

          this.loadUnitesLibres();

          setTimeout(() => this.closeCreateModal(), 1500);
        },
        error: (err) => {
          this.createLoading.set(false);
          this.createError.set(err?.error?.message || 'Une erreur est survenue lors de la création.');
        }
      });
    });
  }

  // Actions Modal Résiliation

  openResilierModal(contrat: BailResponse): void {
    this.selectedContrat.set(contrat);
    this.resilierError.set(null);
    this.showResilierModal.set(true);
  }

  closeResilierModal(): void {
    this.showResilierModal.set(false);
    this.selectedContrat.set(null);
  }

  confirmerResiliation(): void {
    const contrat = this.selectedContrat();
    if (!contrat) return;

    this.resilierLoading.set(true);
    this.resilierError.set(null);

    this.bailService.resilierContrat(contrat.uuid).subscribe({
      next: (updated) => {
        this.contrats.update((list) =>
          list.map((c) => (c.uuid === updated.uuid ? updated : c))
        );
        this.resilierLoading.set(false);
        this.loadUnitesLibres(); // L'unité redevient libre après traitement backend
        this.closeResilierModal();
      },
      error: (err) => {
        this.resilierLoading.set(false);
        this.resilierError.set(err?.error?.message || 'Impossible de résilier ce contrat.');
      }
    });
  }

  //  Helpers UI

  getStatutClass(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif:
        return 'bg-success bg-opacity-10';
      case BailEnum.Resiliation:
        return 'bg-warning bg-opacity-10';
      case BailEnum.Termine:
        return 'bg-danger bg-opacity-10';
      default:
        return 'bg-secondary bg-opacity-10';
    }
  }

  getStatutColor(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif: return '#198754';       // Vert robuste
      case BailEnum.Resiliation: return '#ffc107'; // Jaune robuste
      case BailEnum.Termine: return '#dc3545';     // Rouge robuste
      default: return '#6c757d';
    }
  }

  getStatutLabel(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif: return 'Actif';
      case BailEnum.Resiliation: return 'En cours de résiliation';
      case BailEnum.Termine: return 'Terminé';
      default: return statut;
    }
  }
}
