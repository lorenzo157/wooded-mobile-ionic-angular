import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../auth/auth.service'; // Adjust import as necessary
import { IonicModule } from '@ionic/angular';
import { UiService } from 'src/app/utils/ui.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  imports: [IonicModule],
})
export class NavigationComponent {
  private backButtonSubscription?: Subscription;
  constructor(
    private location: Location,
    private authService: AuthService,
    private uiService: UiService,
    private router: Router,
    private platform: Platform
  ) {}
  ngOnInit() {
    // Handle hardware back button
    this.backButtonSubscription =
      this.platform.backButton.subscribeWithPriority(10, async () => {
        if (this.router.url.includes('/createtree/')) {
          await this.showBackConfirmation();
        } else {
          this.location.back();
        }
      });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }
  // Navigate back to the previous page
  async goBack() {
    const currentRoute = this.router.url;
    console.log(currentRoute);
    if (this.router.url.includes('/createtree/')) {
      await this.showBackConfirmation();
    } else {
      this.location.back();
    }
  }

  private async showBackConfirmation() {
    await this.uiService.alert(
      '¿Seguro que quieres volver? Los datos ingresados se perderán',
      '⚠️',
      [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.location.back();
          },
        },
      ]
    );
  }

  async logout() {
    await this.uiService.alert('¿Salir de la aplicación?', '', [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: () => {
          this.authService.logout(); // Log out if confirmed
        },
      },
    ]);
  }
}
