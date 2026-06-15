import { Component } from '@angular/core';
import {LocatairesTab} from './tabs/locataires-tab/locataires-tab';
import {ContratsTab} from './tabs/contrats-tab/contrats-tab';
import {EcheancesTab} from './tabs/echeances-tab/echeances-tab';
import {RouterLink} from '@angular/router';
export type BailTab = 'locataires' | 'contrats' | 'echeances';
@Component({
  selector: 'app-bail-component',
  imports: [
    LocatairesTab,
    ContratsTab,
    EcheancesTab,
    RouterLink
  ],
  templateUrl: './bail-component.html',
  styleUrl: './bail-component.scss',
})
export class BailComponent {

  activeTab: BailTab = 'locataires';

  tabs: { key: BailTab; label: string; icon: string }[] = [
    { key: 'locataires', label: 'Locataires', icon: 'ri-group-line' },
    { key: 'contrats',   label: 'Contrats',   icon: 'ri-file-text-line' },
    { key: 'echeances',  label: 'Échéances',  icon: 'ri-calendar-check-line' },
  ];

  setTab(tab: BailTab): void {
    this.activeTab = tab;
  }

}
