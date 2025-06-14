import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private loading: any;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {}

  async alert(
    message: string,
    header: string = 'Atención',
    buttons: any = ['Aceptar'],
    backdropDismiss: boolean = true,
    cssClass = '',
  ) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons,
      cssClass,
      backdropDismiss,
    });

    await alert.present();
  }

  async cargando(isCargando: boolean = true) {
    if (isCargando && !this.loading) {
      // Create and show the loading spinner
      this.loading = await this.loadingController.create({
        spinner: 'bubbles',
        message: 'Espere por favor...',
        translucent: true,
        backdropDismiss: false,
      });
      await this.loading.present();
    } else if (this.loading) {
      // Dismiss the spinner when isCargando is false
      await this.loading.dismiss();
      this.loading = null; // Reset the loading variable
    }
  }

  async toast(
    message: string,
    color: string = 'primary',
    duration: number = 5000,
  ) {
    const toast = await this.toastController.create({
      color,
      message,
      duration,
      position: 'top',
    });
    toast.present();
  }
}
