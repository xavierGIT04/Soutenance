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
  user: UserInfo = {} as UserInfo;
  authService = inject(AuthService);
  infos = signal<UserInfo>(this.user);

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: data => {
        this.infos.set(data);
      },
      error: error => {console.log(error);}
    })

    ;
  }


}
