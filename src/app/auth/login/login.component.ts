import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UiService } from '../../utils/ui.service';
import { App } from '@capacitor/app';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private uiService: UiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      await this.uiService.cargando();
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (value) => {
            this.uiService.cargando();
            this.router.navigate(['project']);
          },
          error: (error) => {
            let errorMessage = 'Error desconocido';
            if (error?.error?.message == 'Invalid credentials') {
              errorMessage = 'Credenciales incorrectas.';
            } else if (error?.status == 0) {
              errorMessage = 'No se pudo conectar con el servidor.';
            }
            this.uiService.cargando();
            this.uiService.alert(errorMessage, 'Error');
          },
        });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword() {
    // Implement your forgot password logic here
  }

  exitApp() {
    App.exitApp(); // Closes the application
  }
}
