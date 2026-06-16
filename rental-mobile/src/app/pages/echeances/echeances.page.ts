import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSkeletonText,
  IonChip,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  chevronForwardOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  ellipseOutline,
} from 'ionicons/icons';

import { BailService } from '../../core/services/bail-service';
import { BailResponse, EcheanceResponse, StatutEcheance } from '../../core/models/bail.model';
import { FcfaPipe } from '../../pipes/fcfa-pipe-pipe';

@Component({
  selector: 'app-echeances',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    IonSkeletonText,
    IonChip,
    IonBadge,
    FcfaPipe,
  ],
  templateUrl: './echeances.page.html',
  styleUrl: './echeances.page.scss',
})
export class EcheancesPage implements OnInit {
  protected readonly StatutEcheance = StatutEcheance;

  loading = signal(true);
  contrats = signal<BailResponse[]>([]);
  echeances = signal<EcheanceResponse[]>([]);

  private bailService = inject(BailService);
  private router = inject(Router);

  echeancesEnRetard = computed(() =>
    this.echeances().filter((e) => e.statut === StatutEcheance.Retard),
  );
  echeancesEnAttente = computed(() =>
    this.echeances().filter(
      (e) => e.statut === StatutEcheance.Attente || e.statut === StatutEcheance.PartiellementPaye,
    ),
  );
  echeancesPaye = computed(() =>
    this.echeances().filter((e) => e.statut === StatutEcheance.Paye),
  );

  constructor() {
    addIcons({
      calendarOutline,
      chevronForwardOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
      ellipseOutline,
    });
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(event?: any): void {
    this.loading.set(true);
    this.bailService.mesContrats().subscribe({
      next: (contrats) => {
        this.contrats.set(contrats);
        if (contrats.length === 0) {
          this.loading.set(false);
          event?.target?.complete();
          return;
        }
        const promises = contrats.map(
          (c) =>
            new Promise<EcheanceResponse[]>((resolve) => {
              this.bailService.getEcheancesByContrat(c.uuid).subscribe({
                next: resolve,
                error: () => resolve([]),
              });
            }),
        );
        Promise.all(promises).then((results) => {
          const all = results
            .flat()
            .sort(
              (a, b) =>
                new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime(),
            );
          this.echeances.set(all);
          this.loading.set(false);
          event?.target?.complete();
        });
      },
      error: () => {
        this.loading.set(false);
        event?.target?.complete();
      },
    });
  }

  // Passe l'objet echeance dans le state du router pour éviter un rechargement inutile
  voirEcheance(echeance: EcheanceResponse): void {
    this.router.navigate(['/echeance', echeance.uuid], { state: { echeance } });
  }

  getStatutColor(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:              return 'success';
      case StatutEcheance.PartiellementPaye: return 'warning';
      case StatutEcheance.Retard:            return 'danger';
      default:                                return 'medium';
    }
  }

  getStatutLabel(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:              return 'Payé';
      case StatutEcheance.PartiellementPaye: return 'Partiel';
      case StatutEcheance.Retard:            return 'En retard';
      default:                                return 'En attente';
    }
  }

  getStatutIcon(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:              return 'checkmark-circle-outline';
      case StatutEcheance.Retard:            return 'alert-circle-outline';
      case StatutEcheance.PartiellementPaye: return 'time-outline';
      default:                                return 'ellipse-outline';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  }
}
