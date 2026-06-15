import {Component, inject, OnInit, signal} from '@angular/core';
import {AuthService} from "../../core/service/auth-service";
import {Router} from "@angular/router";
import {LoadingController, ToastController} from "@ionic/angular";
import { AuthRequest } from "src/app/core/models";
import {addIcons} from "ionicons";
import {eyeOffOutline, eyeOutline, lockClosedOutline, phonePortraitOutline} from "ionicons/icons";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // ─── États Réactifs (Signals) ──────────────────────────────────────────────
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // ─── Modèle de Formulaire Signal ───────────────────────────────────────────
  readonly loginModel = signal<AuthRequest>({
    telephone: '',
    codeProprietaire: ''
  });

  // Configuration et règles de validation Signal Forms
  readonly loginForm = form(this.loginModel, (check) => {
    required(check.telephone, { message: 'Le numéro de téléphone est obligatoire.' });
    // Ajusté à 8 chiffres pour correspondre à tes validateurs d'origine
    minLength(check.telephone, 8, { message: 'Le numéro doit contenir exactement 8 chiffres.' });
    maxLength(check.telephone, 8, { message: 'Le numéro doit contenir exactement 8 chiffres.' });

    required(check.codeProprietaire, { message: 'Le code secret est obligatoire.' });
    minLength(check.codeProprietaire, 4, { message: 'Le code doit contenir au moins 4 caractères.' });
  });

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, phonePortraitOutline, lockClosedOutline });
  }

  togglePassword(): void {
    this.showPassword.update(prev => !prev);
  }

  async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault(); // Empêche le rechargement natif de la page mobile

    // Déclenchement de la soumission sécurisée de Signal Forms
    submit(this.loginForm, async () => {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // Création d'un loader Ionic natif pour une meilleure UX mobile
      const loadingEl = await this.loadingCtrl.create({
        message: 'Connexion en cours...',
        spinner: 'crescent'
      });
      await loadingEl.present();

      this.auth.login(this.loginModel()).subscribe({
        next: async () => {
          this.isLoading.set(false);
          await loadingEl.dismiss();

          // Redirection vers l'espace du locataire (par exemple /home ou /tabs/dashboard)
          this.router.navigate(['/tabs/dashboard'], { replaceUrl: true });
        },
        error: async (err) => {
          this.isLoading.set(false);
          await loadingEl.dismiss();

          const msg = err?.error?.message || 'Identifiants incorrects. Réessayez.';
          this.errorMessage.set(msg);

          // Optionnel : Afficher un Toast court en bas de l'écran mobile
          const toast = await this.toastCtrl.create({
            message: msg,
            duration: 3000,
            position: 'bottom',
            color: 'danger'
          });
          await toast.present();
        }
      });
    });
  }
}
