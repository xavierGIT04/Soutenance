import { Component, OnInit, signal, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButton,
  IonInput,
  IonSpinner,
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
  cameraOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth-service';
import { ToastService } from '../../core/services/toast-service';
import { UtilisateurResponse, UpdateInfosRequest } from '../../core/models/auth.model';

// ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://oxlllchsivgvxgdxckpi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGxsY2hzaXZndnhnZHhja3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODQ3NjUsImV4cCI6MjA5NTk2MDc2NX0.U8T4ihoy9sOXVq4ePBKyAwWlCDDctiK50JKzNtT3Cew';
const BUCKET = 'avatars';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonButton,
    IonInput,
    IonSpinner,
    FormsModule,
  ],
  templateUrl: './profil.page.html',
  styleUrl: './profil.page.scss',
})
export class ProfilPage implements OnInit {
  // ── State ──────────────────────────────────────────────────────
  loading        = signal(true);
  savingInfos    = signal(false);
  uploadingAvatar= signal(false);
  editMode       = signal(false);

  user           = signal<UtilisateurResponse | null>(null);

  // Champs du formulaire (liés via ngModel)
  editNom        = '';
  editTelephone  = '';
  editCode       = '';          // nouveau code (optionnel)

  // ── Injections ─────────────────────────────────────────────────
  private authService  = inject(AuthService);
  private toastService = inject(ToastService);
  private alertCtrl    = inject(AlertController);

  constructor() {
    addIcons({
      personOutline,
      callOutline,
      logOutOutline,
      chevronForwardOutline,
      shieldCheckmarkOutline,
      notificationsOutline,
      cameraOutline,
      createOutline,
      checkmarkOutline,
      closeOutline,
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────
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

  // ── Edition infos ──────────────────────────────────────────────
  startEdit(): void {
    const u = this.user();
    if (!u) return;
    this.editNom       = u.nom ?? '';
    this.editTelephone = u.telephone ?? '';
    this.editCode      = '';
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  saveInfos(): void {
    const nom       = this.editNom.trim();
    const telephone = this.editTelephone.trim();
    const code      = this.editCode.trim();

    if (!nom || !telephone) {
      this.toastService.showError('Le nom et le téléphone sont obligatoires.');
      return;
    }
    if (!code) {
      this.toastService.showError('Le code d\'accès actuel est obligatoire pour confirmer.');
      return;
    }

    const payload: UpdateInfosRequest = { nom, telephone, code };

    this.savingInfos.set(true);
    this.authService.updateInfos(payload).subscribe({
      next: (u) => {
        this.user.set(u);
        this.savingInfos.set(false);
        this.editMode.set(false);
        this.toastService.showSuccess('Profil mis à jour !');
      },
      error: () => {
        this.savingInfos.set(false);
        this.toastService.showError('Échec de la mise à jour. Vérifiez votre code.');
      },
    });
  }

  // ── Upload avatar ──────────────────────────────────────────────
  triggerAvatarPicker(): void {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.uploadAvatar(file);
    };
    input.click();
  }

  private async uploadAvatar(file: File): Promise<void> {
    const userUuid = this.user()?.uuid;
    if (!userUuid) return;

    // Extension sécurisée
    const ext      = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${userUuid}.${ext}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;

    this.uploadingAvatar.set(true);

    try {
      // 1. Upload vers Supabase Storage (upsert)
      const res = await fetch(uploadUrl, {
        method : 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type' : file.type,
          'x-upsert'     : 'true',
        },
        body: file,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      // 2. URL publique
      const publicUrl =
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

      // 3. Mettre à jour le backend
      this.authService.updateAvatar(publicUrl).subscribe({
        next: (u) => {
          this.user.set(u);
          this.uploadingAvatar.set(false);
          this.toastService.showSuccess('Photo de profil mise à jour !');
        },
        error: () => {
          this.uploadingAvatar.set(false);
          this.toastService.showError('Erreur lors de l\'enregistrement de la photo.');
        },
      });
    } catch (err) {
      console.error('[Supabase upload]', err);
      this.uploadingAvatar.set(false);
      this.toastService.showError('Erreur lors de l\'upload de la photo.');
    }
  }

  // ── Déconnexion ────────────────────────────────────────────────
  async demanderDeconnexion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header : 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text   : 'Se déconnecter',
          role   : 'destructive',
          handler: () => this.authService.logout(),
        },
      ],
    });
    await alert.present();
  }

  // ── Helpers ────────────────────────────────────────────────────
  getInitiales(): string {
    return (this.user()?.nom ?? '')
      .split(' ')
      .map((w) => w[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');
  }

  formatTelephone(tel: string): string {
    return tel.replace(/\s+/g, '').replace(/(.{2})/g, '$1 ').trim();
  }
}
