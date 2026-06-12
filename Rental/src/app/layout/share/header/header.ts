import {Component, computed, HostListener, inject, OnInit, signal} from '@angular/core';
import {UserInfo} from '../../authentification/dto/response/UserInfo';
import {AuthService} from '../../../services/auth-service';
import {TitleCasePipe} from '@angular/common';
import {PhoneFormatPipe} from '../../../pipes/phone-format-pipe';
import {Router, RouterLink} from '@angular/router';
import {PROFIL} from '../../authentification/dto/request/UserRequest';

@Component({
  selector: 'app-header',
  imports: [
    TitleCasePipe,
    PhoneFormatPipe,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isDropdownOpen.set(false);
    }
  }

  isDropdownOpen = signal<boolean>(false);

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }
  private authService = inject(AuthService);
  protected route = inject(Router);

  infos = signal<UserInfo | null>(null);

  ngOnInit(): void {
    // 3. Récupération des données utilisateur
    this.authService.getMe().subscribe({
      next: (data) => {
        this.infos.set(data);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  protected lienProfil = computed(() => {
    let urlActuelle = ""
    if(this.infos()?.profil === PROFIL.airbn){
      urlActuelle = "/dashboard/airbn";
    }else if(this.infos()?.profil === PROFIL.classique){
      urlActuelle = "/dashboard/classic";
    }
    return `${urlActuelle}/profile`;

  });

}
