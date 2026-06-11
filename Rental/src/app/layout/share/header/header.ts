import {Component, inject, OnInit, signal} from '@angular/core';
import {UserInfo} from '../../authentification/dto/response/UserInfo';
import {AuthService} from '../../../services/auth-service';
import {TitleCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    TitleCasePipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private authService = inject(AuthService);

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

}
