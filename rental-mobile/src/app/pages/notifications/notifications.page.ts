import { Component, OnInit, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonSkeletonText,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  walletOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  calendarOutline,
} from 'ionicons/icons';

import { NotificationStateService } from '../../core/services/notification-state-service';
import { TypeNotification } from '../../core/models/bail.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonSkeletonText,
    IonChip,
  ],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss',
})
export class NotificationsPage implements OnInit {
  protected readonly TypeNotification = TypeNotification;
  public notifState = inject(NotificationStateService);
  loading = false;

  constructor() {
    addIcons({
      notificationsOutline,
      walletOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      informationCircleOutline,
      calendarOutline,
    });
  }

  ngOnInit(): void {
    this.notifState.refresh();
  }

  marquerLue(uuid: string, event: Event): void {
    event.stopPropagation();
    this.notifState.markAsRead(uuid);
  }

  getIcon(type: TypeNotification): string {
    switch (type) {
      case TypeNotification.ConfirmationPaiement: return 'checkmark-circle-outline';
      case TypeNotification.AlerteRetard:         return 'alert-circle-outline';
      case TypeNotification.RelanceLoyer:         return 'calendar-outline';
      default:                                     return 'information-circle-outline';
    }
  }

  getColor(type: TypeNotification): string {
    switch (type) {
      case TypeNotification.ConfirmationPaiement: return 'success';
      case TypeNotification.AlerteRetard:         return 'danger';
      case TypeNotification.RelanceLoyer:         return 'warning';
      default:                                     return 'primary';
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;

    if (diffH < 1)  return 'Il y a moins d\'une heure';
    if (diffH < 24) return `Il y a ${Math.floor(diffH)}h`;
    if (diffH < 48) return 'Hier';

    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
