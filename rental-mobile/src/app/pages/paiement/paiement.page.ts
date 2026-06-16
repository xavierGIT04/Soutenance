import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  openOutline,
  checkmarkCircleOutline,
  phonePortraitOutline,
} from 'ionicons/icons';

import { FcfaPipe } from '../../pipes/fcfa-pipe-pipe';
import { EcheanceResponse } from '../../core/models/bail.model';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    FcfaPipe,
  ],
  templateUrl: './paiement.page.html',
  styleUrl: './paiement.page.scss',
})
export class PaiementPage implements OnInit {
  paymentUrl = signal<string | null>(null);
  montant = signal<string | number | null>(null);
  echeance = signal<EcheanceResponse | null>(null);
  opened = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    addIcons({ arrowBackOutline, openOutline, checkmarkCircleOutline, phonePortraitOutline });
  }

  ngOnInit(): void {
    const state = history.state as {
      paymentUrl?: string;
      montant?: string | number;
      echeance?: EcheanceResponse;
    };
    this.paymentUrl.set(state?.paymentUrl ?? null);
    this.montant.set(state?.montant ?? null);
    this.echeance.set(state?.echeance ?? null);
  }

  ouvrirPaiement(): void {
    const url = this.paymentUrl();
    if (!url) return;
    window.open(url, '_blank');
    this.opened.set(true);
  }

  retourDashboard(): void {
    this.router.navigate(['/tabs/dashboard']);
  }
}
