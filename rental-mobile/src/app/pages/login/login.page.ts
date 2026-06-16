import {Component, inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, lockClosedOutline, logInOutline, businessOutline } from 'ionicons/icons';

import { AuthService } from '../../core/services/auth-service';
import { ToastService } from '../../core/services/toast-service';
import { AuthRequest, RoleEnum } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormField,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  loading = signal(false);
  submitError = signal<string | null>(null);
  private authService = inject(AuthService)
  private toastService = inject(ToastService)
  private router = inject(Router)

  loginModel = signal<AuthRequest>({
    telephone: '',
    codeProprietaire: '',
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.telephone, { message: 'Le numéro est obligatoire' });
    required(fieldPath.codeProprietaire, { message: 'Le code est obligatoire' });
    maxLength(fieldPath.telephone, 8);
    maxLength(fieldPath.codeProprietaire, 8);
  });

  constructor(
  ) {
    addIcons({ callOutline, lockClosedOutline, logInOutline, businessOutline });
  }

  onSubmit(event:SubmitEvent): void {
    event.preventDefault()
    this.submitError.set(null);

    submit(this.loginForm, async () => {
      this.loading.set(true);
      const credentials = this.loginModel();

      this.authService.login(credentials).subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.role !== RoleEnum.LOCATAIRE) {
            this.submitError.set('Ce compte n\'est pas un compte locataire.');
            this.authService.logout();
            return;
          }
          console.log("réussi")
          this.toastService.showSuccess(`Bienvenue ${res.nom} !`);
          this.router.navigate(['/tabs/dashboard']);
        },
        error: (err: Error) => {
          console.log("réussi")
          this.loading.set(false);
          this.submitError.set(err.message || 'Une erreur inconnue est survenue.');
        },
      });
    });
  }
}
