import { Component, OnInit, computed, signal, inject } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  chevronForwardOutline,
  walletOutline,
  calendarNumberOutline,
  businessOutline,
  alertCircleOutline,
} from 'ionicons/icons';

import { BailService } from '../../core/services/bail-service';
import { AuthService } from '../../core/services/auth-service';
import { BailResponse, BailEnum } from '../../core/models/bail.model';
import { FcfaPipe } from '../../pipes/fcfa-pipe-pipe';

@Component({
  selector: 'app-dashboard',
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
    FcfaPipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  protected readonly BailEnum = BailEnum;

  loading = signal(true);
  contrats = signal<BailResponse[]>([]);
  private bailService = inject(BailService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  contratsActifs = computed(() =>
    this.contrats().filter((c) => c.statut === BailEnum.Actif),
  );
  loyerTotalMensuel = computed(() =>
    this.contratsActifs().reduce((sum, c) => sum + (+c.loyer || 0), 0),
  );

  constructor() {
    addIcons({
      homeOutline,
      chevronForwardOutline,
      walletOutline,
      calendarNumberOutline,
      businessOutline,
      alertCircleOutline,
    });
  }

  ngOnInit(): void {
    this.authService.getMe().subscribe();
    this.chargerContrats();
  }

  chargerContrats(event?: any): void {
    this.loading.set(true);
    this.bailService.mesContrats().subscribe({
      next: (data) => {
        this.contrats.set(data);
        this.loading.set(false);
        event?.target?.complete();
      },
      error: () => {
        this.loading.set(false);
        event?.target?.complete();
      },
    });
  }

  voirContrat(uuid: string): void {
    this.router.navigate(['/contrat', uuid]);
  }

  getStatutLabel(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif:       return 'Actif';
      case BailEnum.Resiliation: return 'En résiliation';
      case BailEnum.Termine:     return 'Terminé';
      default:                   return statut;
    }
  }

  getStatutColor(statut: BailEnum): string {
    switch (statut) {
      case BailEnum.Actif:       return 'success';
      case BailEnum.Resiliation: return 'warning';
      case BailEnum.Termine:     return 'medium';
      default:                   return 'medium';
    }
  }
}
