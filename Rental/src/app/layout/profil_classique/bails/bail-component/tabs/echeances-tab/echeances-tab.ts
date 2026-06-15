import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {BailService} from '../../../../../../services/bail-service';
import {EcheanceResponse, StatutEcheance} from "../../../dto/response/EcheanceResponse";
import {PaiementResponse} from "../../../dto/response/PaiementResponse";
import {ModePaiement, PaiementRequest} from '../../../dto/request/PaiementRequest';
import {form, FormField, required, submit} from '@angular/forms/signals';
import {EcheanceRequest} from '../../../dto/request/EcheanceRequest';
import {DatePipe, DecimalPipe, NgClass} from '@angular/common';

export type EcheanceFiltre = 'toutes' | 'soldees' | 'non_soldees';
@Component({
  selector: 'app-echeances-tab',
  imports: [
    FormField,
    DecimalPipe,
    DatePipe,
    NgClass
  ],
  templateUrl: './echeances-tab.html',
  styleUrl: './echeances-tab.scss',
})
export class EcheancesTab implements OnInit {

  private bailService = inject(BailService);

  readonly echeances = signal<EcheanceResponse[]>([]);
  readonly contratsActifs = signal<any[]>([]); // Pour le select du modal d'ajout
  readonly loading = signal<boolean>(false);
  readonly filtre = signal<EcheanceFiltre>('toutes');
  readonly contratUuidFiltre = signal<string>('');


  readonly filteredEcheances = computed(() => {
    let list = this.echeances();

    // Filtre par contrat s'il y en a un de sélectionné
    if (this.contratUuidFiltre().trim()) {
      // Filtrage local ou rafraîchissement géré selon votre flux
    }

    // Filtre par état de solde
    switch (this.filtre()) {
      case 'soldees':
        return list.filter((e) => this.estSoldee(e));
      case 'non_soldees':
        return list.filter((e) => !this.estSoldee(e));
      default:
        return list;
    }
  });

  //  Modal Historique des Paiements
  readonly showPaiementsModal = signal<boolean>(false);
  readonly selectedEcheance = signal<EcheanceResponse | null>(null);
  readonly paiements = signal<PaiementResponse[]>([]);
  readonly paiementsLoading = signal<boolean>(false);

  readonly totalPaiements = computed(() =>
    this.paiements().reduce((sum, p) => sum + Number(p.montant), 0)
  );

  readonly resteAPayer = computed(() => {
    const e = this.selectedEcheance();
    return e ? Math.max(0, + Number(e.montantRestant)) : 0;
  });

  readonly showPaiementEspecesModal = signal<boolean>(false);
  readonly paiementEspecesLoading = signal<boolean>(false);
  readonly paiementEspecesError = signal<string | null>(null);
  readonly paiementEspecesSuccess = signal<string | null>(null);

  readonly paiementModel = signal<PaiementRequest>({
    echeanceUuid: '',
    montant: '',
    modePaiement: ModePaiement.Espece,
    referencePaiement: ''
  });

  readonly paiementForm = form(this.paiementModel, (check) => {
    required(check.montant, { message: 'Le montant du versement est obligatoire.' });
  });


  readonly showAddEcheanceModal = signal<boolean>(false);
  readonly addEcheanceLoading = signal<boolean>(false);
  readonly addEcheanceError = signal<string | null>(null);
  readonly addEcheanceSuccess = signal<string | null>(null);

  readonly echeanceModel = signal<EcheanceRequest>({
    contrat_id: '',
    dateEcheance: new Date(),
  });

  readonly addEcheanceForm = form(this.echeanceModel, (check) => {
    required(check.contrat_id, { message: 'Veuillez sélectionner un contrat.' });
    required(check.dateEcheance, { message: 'La date d\'échéance est obligatoire.' });
  });

  ngOnInit(): void {
    this.loadEcheancesEnRetard();
    this.loadContratsActifs();
  }



  loadEcheancesEnRetard(): void {
    this.loading.set(true);
    this.bailService.getEcheancesEnRetard().subscribe({
      next: (data) => {
        this.echeances.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadEcheancesContrat(): void {
    if (!this.contratUuidFiltre().trim()) {
      this.loadEcheancesEnRetard();
      return;
    }
    this.loading.set(true);
    this.bailService.getEcheancesByContrat(this.contratUuidFiltre()).subscribe({
      next: (data) => {
        this.echeances.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadContratsActifs(): void {
    this.bailService.mesContrat().subscribe({
      next: (data) => this.contratsActifs.set(data.filter((c: any) => c.statut === 'ACTIF'))
    });
  }



  voirPaiements(echeance: EcheanceResponse): void {
    this.selectedEcheance.set(echeance);
    this.paiements.set([]);
    this.paiementsLoading.set(true);
    this.showPaiementsModal.set(true);

    this.bailService.getPaiementsByEcheance(echeance.uuid).subscribe({
      next: (data) => {
        this.paiements.set(data);
        this.paiementsLoading.set(false);
      },
      error: () => this.paiementsLoading.set(false),
    });
  }

  closePaiementsModal(): void {
    this.showPaiementsModal.set(false);
    this.selectedEcheance.set(null);
    this.paiements.set([]);
  }



  ouvrirPaiementEspeces(echeance: EcheanceResponse): void {
    this.selectedEcheance.set(echeance);

    this.paiementModel.set({
      echeanceUuid: echeance.uuid,
      montant: echeance.montantRestant,
      modePaiement: ModePaiement.Espece,
      referencePaiement: ''
    });

    this.paiementEspecesError.set(null);
    this.paiementEspecesSuccess.set(null);
    this.showPaiementEspecesModal.set(true);
  }

  closePaiementEspecesModal(): void {
    this.showPaiementEspecesModal.set(false);
    this.paiementForm().reset();
  }

  soumettrePaiementEspeces(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.paiementForm, async () => {
      if (+this.paiementModel().montant <= 0) {
        this.paiementEspecesError.set('Le montant versé doit être strictement supérieur à 0 F.');
        return;
      }

      this.paiementEspecesLoading.set(true);
      this.paiementEspecesError.set(null);

      this.bailService.enregistrerPaiement(this.paiementModel()).subscribe({
        next: () => {
          this.paiementEspecesLoading.set(false);
          this.paiementEspecesSuccess.set('Encaissement en espèces validé quittance générée.');

          // Recharger le jeu de données selon le filtre en cours
          if (this.contratUuidFiltre().trim()) {
            this.loadEcheancesContrat();
          } else {
            this.loadEcheancesEnRetard();
          }

          setTimeout(() => this.closePaiementEspecesModal(), 1500);
        },
        error: (err) => {
          this.paiementEspecesLoading.set(false);
          this.paiementEspecesError.set(err?.error?.message || "Erreur lors de l'enregistrement.");
        },
      });
    });
  }



  ouvrirAddEcheance(): void {
    this.addEcheanceError.set(null);
    this.addEcheanceSuccess.set(null);

    this.echeanceModel.set({
      contrat_id: this.contratUuidFiltre() || '',
      dateEcheance: new Date(),
    });

    this.showAddEcheanceModal.set(true);
  }

  closeAddEcheanceModal(): void {
    this.showAddEcheanceModal.set(false);
    this.addEcheanceForm().reset();
  }

  soumettreAddEcheance(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.addEcheanceForm, async () => {
      this.addEcheanceLoading.set(true);
      this.addEcheanceError.set(null);

      this.bailService.addEcheance(this.echeanceModel()).subscribe({
        next: (newEcheance) => {
          this.echeances.update((list) => [newEcheance, ...list]);
          this.addEcheanceLoading.set(false);
          this.addEcheanceSuccess.set('Nouvel appel d\'échéance ajouté avec succès.');
          setTimeout(() => this.closeAddEcheanceModal(), 1500);
        },
        error: (err) => {
          this.addEcheanceLoading.set(false);
          this.addEcheanceError.set(err?.error?.message || 'Erreur lors de la création.');
        },
      });
    });
  }



  estSoldee(e: EcheanceResponse): boolean {
    return e.statut === StatutEcheance.Paye;
  }

  getStatutClass(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:
        return 'bg-success bg-opacity-10 text-success border-success border-opacity-20';
      case StatutEcheance.Retard:
        return 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-20';
      case StatutEcheance.Partiellement_Paye:
        return 'bg-info bg-opacity-10 text-info border-info border-opacity-20';
      case StatutEcheance.Attente:
        return 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-20';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  }

  getStatutLabel(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye: return 'Soldée';
      case StatutEcheance.Partiellement_Paye: return 'Partiel';
      case StatutEcheance.Retard: return 'En retard';
      case StatutEcheance.Attente: return 'En attente';
      default: return statut;
    }
  }
}
