import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { PROFIL } from '../../authentification/dto/request/UserRequest';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  allowedProfils: string[]; // Quels profils ont le droit de voir ce menu ?
  exact: boolean;
}

@Component({
  selector: 'app-aside-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside-bar.html',
  styleUrl: './aside-bar.scss',
})
export class AsideBar {
  authService = inject(AuthService);

  private allMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-home',
      link: '/dashboard/classic',
      allowedProfils: [PROFIL.classique],
      exact: true,
    },
    {
      label: 'Dashboard',
      icon: 'fas fa-home',
      link: '/dashboard/airbnb',
      allowedProfils: [PROFIL.airbn],
      exact: true,
    },
    {
      label: 'Propriétés',
      icon: 'fas fa-building',
      link: '/dashboard/classic/proprietes',
      allowedProfils: [PROFIL.classique],
      exact: false,
    },
    {
      label: 'Logements',
      icon: 'fas fa-building',
      link: '/dashboard/airbnb/logements',
      allowedProfils: [PROFIL.airbn],
      exact: false,
    },
    {
      label: 'Baux',
      icon: 'fas fa-house-user',
      link: '/dashboard/classic/baux',
      allowedProfils: [PROFIL.classique],
      exact: false,
    },
  ];

  filteredMenu = computed(() => {
    const currentProfil = this.authService.currentUserProfil();
    if (!currentProfil) return [];

    return this.allMenuItems.filter((item) => item.allowedProfils.includes(currentProfil));
  });
}
