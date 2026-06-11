import {Component, computed, inject} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {PROFIL} from '../../authentification/dto/request/UserRequest';
import {RouterLink} from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  allowedProfils: string[]; // Quels profils ont le droit de voir ce menu ?
}

@Component({
  selector: 'app-aside-bar',
  imports: [
    RouterLink
  ],
  templateUrl: './aside-bar.html',
  styleUrl: './aside-bar.scss',
})
export class AsideBar {

  authService = inject(AuthService);

  private allMenuItems: MenuItem[] = [
    { label: 'Dashboard Classique', icon: 'icon-house', link: '/dashboard/classic', allowedProfils: [PROFIL.classique] },
    { label: 'Dashboard Airbnb', icon: 'icon-calendar-days', link: '/dashboard/airbn', allowedProfils: [PROFIL.airbn] },
  ];

  filteredMenu = computed(() => {
    const currentProfil = this.authService.currentUserProfil();
    if (!currentProfil) return [];

    return this.allMenuItems.filter(item => item.allowedProfils.includes(currentProfil));
  });

}
