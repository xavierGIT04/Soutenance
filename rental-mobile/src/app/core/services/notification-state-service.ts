import {inject, Injectable, signal} from '@angular/core';
import { BailService } from './bail-service';
import { NotificationResponse } from '../models/bail.model';

@Injectable({ providedIn: 'root' })
export class NotificationStateService {
  readonly notifications = signal<NotificationResponse[]>([]);
  readonly unreadCount = signal<number>(0);
  private bailService = inject(BailService)

  refresh(): void {
    this.bailService.getNotificationsNonLues().subscribe({
      next: (list) => {
        this.notifications.set(list);
        this.unreadCount.set(list.length);
      },
      error: () => {

      },
    });
  }

  markAsRead(uuid: string): void {
    this.bailService.marquerNotificationLue(uuid).subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => n.uuid !== uuid));
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }
}
