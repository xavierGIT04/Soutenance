import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../footer/footer';
import {Header} from '../header/header';
import {AsideBar} from '../aside-bar/aside-bar';

@Component({
  selector: 'app-main-component',
  imports: [
    RouterOutlet,
    Footer,
    Header,
    AsideBar
  ],
  templateUrl: './main-component.html',
  styleUrl: './main-component.scss',
})
export class MainComponent {

}
