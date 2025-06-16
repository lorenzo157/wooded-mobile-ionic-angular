import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../auth/auth.service'; // Adjust import as necessary
import { IonicModule } from '@ionic/angular';
import { UiService } from 'src/app/utils/ui.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  imports: [IonicModule],
})
export class NavigationComponent {
  constructor(
    private location: Location,
    private authService: AuthService,
    private uiService: UiService,
    private router: Router,
  ) {}

  // Navigate back to the previous page
  async goBack() {
    const currentRoute = this.router.url;
    console.log(currentRoute);
    if (this.router.url.includes('/createtree/')) {
      // only apply for create or edit tree routes
      await this.uiService.alert('¿Volver a la pantalla anterior?', '', [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.location.back(); // Navigate back if confirmed
          },
        },
      ]);
    } else {
      this.location.back(); // Directly navigate back for other routes
    }
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
