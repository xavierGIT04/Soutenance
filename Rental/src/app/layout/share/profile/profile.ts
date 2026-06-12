import {Component, inject, OnInit, signal} from '@angular/core';
import {StorageService} from '../../../services/storage-service';
import {AuthService} from '../../../services/auth-service';
import {UserInfo} from '../../authentification/dto/response/UserInfo';
import {TitleCasePipe} from '@angular/common';
import {PhoneFormatPipe} from '../../../pipes/phone-format-pipe';
import {PROFIL, ROLE, UserRequest} from '../../authentification/dto/request/UserRequest';
import {form, FormField, maxLength, required, submit} from '@angular/forms/signals';


@Component({
  selector: 'app-profile',
  imports: [
    TitleCasePipe,
    PhoneFormatPipe,
    FormField
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  ngOnInit(): void {

    this.authService.getMe().subscribe({
      next: (data) => {
        this.infos.set(data);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    });

  }

  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  infos = signal<UserInfo | null>(null);
  submitError = signal<string | null>(null);

  model = signal<{
                                        code: string;
                                        nom:string,
                                        telephone:string,
                                        profil:PROFIL | undefined,
                                        role:ROLE }>({
    code: '',
    nom: this.infos()?.nom?? '',
    telephone: this.infos()?.telephone?? '',
    profil: this.infos()?.profil?? undefined,
    role: ROLE.Propritaire,
  });

  updateForm = form(this.model, (fieldPath)=>{
    required(fieldPath.nom, {message:"le nom est obligatoire"});
    required(fieldPath.code, {message:"le code est obligatoire"});
    maxLength(fieldPath.code, 5);
    required(fieldPath.telephone, {message:"le numéro est obligatoire"});
    maxLength(fieldPath.telephone!, 8);
  })


  OnSubmit(event: SubmitEvent) {
    event.preventDefault();
    submit(this.updateForm, async()=>{
      this.authService.updateInfos(this.model()).subscribe({
        next:(data)=>{
          this.infos.set(data)
        },
        error:(err:Error)=>{
          console.log(err.message);
          this.submitError.set(err.message || "Une erreur inconnue est survenue.");
        }
      })
    } )
  }



  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Récupération directe depuis le localStorage
      const userId = localStorage.getItem('user_uuid') || 'unknown';

      // 1. Upload vers Supabase Storage
      const publicUrl = await this.storageService.uploadAvatar(file, userId);

      if (publicUrl) {
        // 2. Mettre à jour l'API Spring Boot avec la nouvelle URL de l'image
        this.authService.updateAvatar(publicUrl).subscribe({
          next: (updatedUser) => {
            // 3. Mettre à jour le signal local pour rafraîchir l'avatar à l'écran
            this.infos.set(updatedUser);
            alert('Photo de profil mise à jour avec succès !');
          },
          error: (err) => console.error("Erreur lors de la mise à jour du profil", err)
        });
      }
    }
  }


}
