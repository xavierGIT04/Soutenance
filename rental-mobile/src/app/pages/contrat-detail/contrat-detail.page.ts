import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSkeletonText,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  walletOutline,
  businessOutline,
  chevronForwardOutline,
  documentTextOutline,
  personOutline,
  callOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  ellipseOutline,
} from 'ionicons/icons';

import { BailService } from '../../core/services/bail-service';
import { BailResponse, BailEnum, EcheanceResponse, StatutEcheance } from '../../core/models/bail.model';
import { FcfaPipe } from '../../pipes/fcfa-pipe-pipe';
import { PhoneFormatPipe } from '../../pipes/phone-format-pipe-pipe';

@Component({
  selector: 'app-contrat-detail',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonSkeletonText,
    IonChip,
    FcfaPipe,
    PhoneFormatPipe,
  ],
  templateUrl: './contrat-detail.page.html',
  styleUrl: './contrat-detail.page.scss',
})
export class ContratDetailPage implements OnInit {
  protected readonly BailEnum = BailEnum;
  protected readonly StatutEcheance = StatutEcheance;

  loading = signal(true);
  loadingEcheances = signal(true);
  contrat = signal<BailResponse | null>(null);
  echeances = signal<EcheanceResponse[]>([]);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bailService = inject(BailService);

  constructor() {
    addIcons({
      arrowBackOutline,
      calendarOutline,
      walletOutline,
      businessOutline,
      chevronForwardOutline,
      documentTextOutline,
      personOutline,
      callOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
      ellipseOutline,
    });
  }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid')!;
    this.charger(uuid);
  }

  charger(uuid: string): void {
    this.loading.set(true);
    this.bailService.mesContrats().subscribe({
      next: (contrats) => {
        const found = contrats.find((c) => c.uuid === uuid) ?? null;
        this.contrat.set(found);
        this.loading.set(false);

        if (found) {
          this.loadingEcheances.set(true);
          this.bailService.getEcheancesByContrat(found.uuid).subscribe({
            next: (list) => {
              const sorted = list.sort(
                (a, b) => new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime(),
              );
              this.echeances.set(sorted);
              this.loadingEcheances.set(false);
            },
            error: () => this.loadingEcheances.set(false),
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  voirEcheance(echeance: EcheanceResponse): void {
    this.router.navigate(['/echeance', echeance.uuid], { state: { echeance } });
  }

  getStatutContratColor(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif:       return 'success';
      case BailEnum.Resiliation: return 'warning';
      default:                   return 'medium';
    }
  }

  getStatutContratLabel(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif:       return 'Actif';
      case BailEnum.Resiliation: return 'En résiliation';
      case BailEnum.Termine:     return 'Terminé';
      default:                   return statut;
    }
  }

  getStatutEcheanceColor(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:             return 'success';
      case StatutEcheance.PartiellementPaye: return 'warning';
      case StatutEcheance.Retard:           return 'danger';
      default:                               return 'medium';
    }
  }

  getStatutEcheanceLabel(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:             return 'Payé';
      case StatutEcheance.PartiellementPaye: return 'Partiel';
      case StatutEcheance.Retard:           return 'En retard';
      default:                               return 'En attente';
    }
  }

  getStatutEcheanceIcon(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:             return 'checkmark-circle-outline';
      case StatutEcheance.Retard:           return 'alert-circle-outline';
      case StatutEcheance.PartiellementPaye: return 'time-outline';
      default:                               return 'ellipse-outline';
    }
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatMois(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  }
}
