import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {PROFIL, ROLE, UserRequest} from '../../../../../authentification/dto/request/UserRequest';
import {form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {BailService} from '../../../../../../services/bail-service';
import {UserInfo} from '../../../../../authentification/dto/response/UserInfo';

@Component({
  selector: 'app-locataires-tab',
  imports: [
    FormField
  ],
  templateUrl: './locataires-tab.html',
  styleUrl: './locataires-tab.scss',
})
export class LocatairesTab implements OnInit {

  private bailService = inject(BailService);

  // États globaux
  readonly locataires = signal<UserInfo[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  // Filtrage réactif
  readonly filteredLocataires = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.locataires();
    return this.locataires().filter(
      (l) =>
        l.nom?.toLowerCase().includes(term) ||
        l.telephone?.toLowerCase().includes(term)
    );
  });

  //  État modal
  readonly showModal = signal<boolean>(false);
  readonly modalLoading = signal<boolean>(false);
  readonly modalError = signal<string | null>(null);
  readonly modalSuccess = signal<string | null>(null);


  readonly userModel = signal<UserRequest>({
    nom: '',
    telephone: '',
    code: '',
    profil: PROFIL.user,
    role: ROLE.Locataire
  });


  readonly locataireForm = form(this.userModel, (check) => {
    required(check.nom, { message: 'Le nom complet est obligatoire.' });
    required(check.telephone, { message: 'Le numéro de téléphone est obligatoire.' });
    required(check.code, { message: 'Le code est obligatoire.' });
    maxLength(check.telephone, 8);
    maxLength(check.code, 5);
  });

  ngOnInit(): void {
    this.loadLocataires();
  }



  loadLocataires(): void {
    this.loading.set(true);
    this.bailService.mesLocataires().subscribe({
      next: (data) => {
        this.locataires.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(): void {
    this.modalError.set(null);
    this.modalSuccess.set(null);

    // Réinitialisation du modèle via le signal
    this.userModel.set({
      nom: '',
      telephone: '',
      code: '',
      profil: PROFIL.user,
      role: ROLE.Locataire
    });

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.locataireForm().reset();
  }

  submitForm(event: SubmitEvent): void {
    event.preventDefault();

    submit(this.locataireForm, async () => {
      this.modalLoading.set(true);
      this.modalError.set(null);

      this.bailService.addLocataire(this.userModel()).subscribe({
        next: (newLocataire) => {
          this.locataires.update((list) => [newLocataire, ...list]);
          this.modalLoading.set(false);
          this.modalSuccess.set('Locataire ajouté avec succès.');

          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.modalLoading.set(false);
          this.modalError.set(
            err?.error?.message || 'Une erreur est survenue lors de l\'enregistrement.'
          );
        },
      });
    });
  }

  //  Helpers

  getInitiales(nom: string): string {
    if (!nom) return '';
    return nom
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  }
}
