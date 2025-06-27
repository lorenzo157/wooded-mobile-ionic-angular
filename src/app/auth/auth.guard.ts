import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { UiService } from '../utils/ui.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private uiService: UiService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.getToken().pipe(
      map((token) => {
        
        console.log('guard on, verify if token exist', token ? true : false);
        if (token) {
          if (!this.authService.isTokenExpired(token))
            return true; // Allow access
          else
            this.uiService.alert(
              'Ingrese sus credenciales nuevamente',
              'Sesión expirada',
            );
        } else {
          this.uiService.alert('Ingrese sus credenciales', 'No authorizado');
        }
        return this.router.createUrlTree(['/auth']); // Redirect to login
      }),
    );
  }
}
