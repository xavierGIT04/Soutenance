import {Component, OnInit, computed, inject, signal} from '@angular/core';
import {DatePipe, DecimalPipe, NgClass} from '@angular/common';
import {DashboardService} from '../../../../services/dashboard-service';
import {BienService} from '../../../../services/bien-service';
import {DashboardProfilAResponse} from '../dto/response/DashboardResponse';
import {BienResponse} from '../../biens/dto/response/BienResponse';
import {StatutEcheance} from '../../bails/dto/response/EcheanceResponse';

@Component({
  selector: 'app-indicateurs-component',
  imports: [
    DecimalPipe,
    DatePipe,
    NgClass,
  ],
  templateUrl: './indicateurs-component.html',
  styleUrl: './indicateurs-component.scss',
})
export class IndicateursComponent implements OnInit {

  private dashboardService = inject(DashboardService);
  private bienService = inject(BienService);

  readonly loading = signal<boolean>(false);
  readonly erreur = signal<string | null>(null);
  readonly data = signal<DashboardProfilAResponse | null>(null);
  readonly biens = signal<BienResponse[]>([]);

  // Filtres dynamiques (Module A5)
  readonly bienUuidFiltre = signal<string>('');
  readonly anneeFiltre = signal<number>(new Date().getFullYear());
  readonly moisFiltre = signal<number>(0); // 0 = année entière

  readonly annees = computed(() => {
    const courante = new Date().getFullYear();
    return [courante, courante - 1, courante - 2];
  });

  readonly mois = [
    {value: 1, label: 'Janvier'}, {value: 2, label: 'Février'}, {value: 3, label: 'Mars'},
    {value: 4, label: 'Avril'}, {value: 5, label: 'Mai'}, {value: 6, label: 'Juin'},
    {value: 7, label: 'Juillet'}, {value: 8, label: 'Août'}, {value: 9, label: 'Septembre'},
    {value: 10, label: 'Octobre'}, {value: 11, label: 'Novembre'}, {value: 12, label: 'Décembre'},
  ];

  ngOnInit(): void {
    this.chargerBiens();
    this.chargerDashboard();
  }

  chargerBiens(): void {
    this.bienService.allBien().subscribe({
      next: (data) => this.biens.set(data),
    });
  }

  chargerDashboard(): void {
    this.loading.set(true);
    this.erreur.set(null);

    this.dashboardService.getDashboardProfilA({
      bienUuid: this.bienUuidFiltre() || undefined,
      annee: this.anneeFiltre(),
      mois: this.moisFiltre() || undefined,
    }).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.erreur.set(err?.error?.message || 'Erreur lors du chargement du dashboard.');
        this.loading.set(false);
      },
    });
  }

  onFiltreChange(): void {
    this.chargerDashboard();
  }

  getStatutClass(statut: StatutEcheance): string {
    switch (statut) {
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
      case StatutEcheance.Partiellement_Paye: return 'Partiel';
      case StatutEcheance.Retard: return 'En retard';
      case StatutEcheance.Attente: return 'En attente';
      default: return statut;
    }
  }
}
