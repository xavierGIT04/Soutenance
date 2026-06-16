import { Component, OnInit, signal, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  callOutline,
  logOutOutline,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  notificationsOutline,
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth-service';
import { UtilisateurResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonButton,
  ],
  templateUrl: './profil.page.html',
  styleUrl: './profil.page.scss',
})
export class ProfilPage implements OnInit {
  loading = signal(true);
  user = signal<UtilisateurResponse | null>(null);

  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({
      personOutline,
      callOutline,
      logOutOutline,
      chevronForwardOutline,
      shieldCheckmarkOutline,
      notificationsOutline,
    });
  }

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(this.authService.currentUser());
        this.loading.set(false);
      },
    });
  }

  async demanderDeconnexion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Se déconnecter',
          role: 'destructive',
          handler: () => this.authService.logout(),
        },
      ],
    });
    await alert.present();
  }

  getInitiales(): string {
    const nom = this.user()?.nom ?? '';
    return nom
      .split(' ')
      .map((w) => w[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');
  }

  formatTelephone(tel: string): string {
    return tel.replace(/(.{2})/g, '$1 ').trim();
  }
}
