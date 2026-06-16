import {Component, inject, OnInit} from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  homeSharp,
  calendarOutline,
  calendarSharp,
  notificationsOutline,
  notificationsSharp,
  personOutline,
  personSharp,
} from 'ionicons/icons';

import { NotificationStateService } from '../core/services/notification-state-service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
})
export class TabsPage implements OnInit {
  public notifState = inject(NotificationStateService);
  constructor() {
    addIcons({
      homeOutline, homeSharp,
      calendarOutline, calendarSharp,
      notificationsOutline, notificationsSharp,
      personOutline, personSharp,
    });
  }

  ngOnInit(): void {
    this.notifState.refresh();
  }
}
