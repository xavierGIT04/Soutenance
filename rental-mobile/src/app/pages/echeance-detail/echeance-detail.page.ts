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
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  walletOutline,
  calendarOutline,
  phonePortraitOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  timeOutline,
  ellipseOutline,
  receiptOutline,
  cardOutline,
} from 'ionicons/icons';

import { BailService } from '../../core/services/bail-service';
import { ToastService } from '../../core/services/toast-service';
import {
  EcheanceResponse,
  PaiementResponse,
  StatutEcheance,
} from '../../core/models/bail.model';
import { FcfaPipe } from '../../pipes/fcfa-pipe-pipe';

@Component({
  selector: 'app-echeance-detail',
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
    IonButton,
    FcfaPipe,
  ],
  templateUrl: './echeance-detail.page.html',
  styleUrl: './echeance-detail.page.scss',
})
export class EcheanceDetailPage implements OnInit {
  protected readonly StatutEcheance = StatutEcheance;

  loading = signal(true);
  loadingPaiements = signal(true);
  initiating = signal(false);

  echeance = signal<EcheanceResponse | null>(null);
  paiements = signal<PaiementResponse[]>([]);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bailService = inject(BailService);
  private toastService = inject(ToastService);

  constructor() {
    addIcons({
      arrowBackOutline,
      walletOutline,
      calendarOutline,
      phonePortraitOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      timeOutline,
      ellipseOutline,
      receiptOutline,
      cardOutline,
    });
  }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid')!;
    this.charger(uuid);
  }

  charger(uuid: string): void {
    // Pour récupérer l'échéance, on passe via la route /paiements qui utilise l'uuid
    // On charge les paiements et on reconstitue depuis la liste des échéances du contrat
    // Ici on navigue via /echeance/:uuid, on va d'abord chercher les paiements
    this.loading.set(false); // L'échéance vient de l'état de navigation ou est rechargée

    // Récupérer l'objet depuis le state du router si disponible (passé depuis la page précédente)
    const state = history.state as { echeance?: EcheanceResponse };
    if (state?.echeance) {
      this.echeance.set(state.echeance);
      this.chargerPaiements(uuid);
    } else {
      // Fallback : on utilise l'uuid pour charger les paiements directement
      this.loading.set(false);
      this.chargerPaiements(uuid);
    }
  }

  chargerPaiements(echeanceUuid: string): void {
    this.loadingPaiements.set(true);
    this.bailService.getPaiementsByEcheance(echeanceUuid).subscribe({
      next: (list) => {
        this.paiements.set(list);
        this.loadingPaiements.set(false);
      },
      error: () => this.loadingPaiements.set(false),
    });
  }

  initierPaiement(): void {
    const e = this.echeance();
    if (!e) return;
    this.initiating.set(true);

    this.bailService.initierPaiementMobile({ echeanceUuid: e.uuid }).subscribe({
      next: (res) => {
        this.initiating.set(false);
        // Naviguer vers la page paiement avec l'URL FedaPay
        this.router.navigate(['/paiement', e.uuid], {
          state: { paymentUrl: res.paymentUrl, montant: res.montant, echeance: e },
        });
      },
      error: () => {
        this.initiating.set(false);
        this.toastService.showError('Impossible d\'initier le paiement. Réessayez.');
      },
    });
  }

  peutPayer(): boolean {
    const e = this.echeance();
    if (!e) return false;
    return e.statut !== StatutEcheance.Paye;
  }

  getStatutColor(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:             return 'success';
      case StatutEcheance.PartiellementPaye: return 'warning';
      case StatutEcheance.Retard:           return 'danger';
      default:                               return 'medium';
    }
  }

  getStatutLabel(statut: StatutEcheance): string {
    switch (statut) {
      case StatutEcheance.Paye:             return 'Payé';
      case StatutEcheance.PartiellementPaye: return 'Partiellement payé';
      case StatutEcheance.Retard:           return 'En retard';
      default:                               return 'En attente';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
