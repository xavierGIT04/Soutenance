import {inject, Injectable} from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastController = inject(ToastController)

  async showSuccess(message: string, duration = 2500): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  async showError(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  async showInfo(message: string, duration = 2500): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'dark',
      position: 'top',
      icon: 'information-circle-outline',
    });
    await toast.present();
  }
}
