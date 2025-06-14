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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private uiService: UiService,
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
            this.uiService.cargando();
            this.uiService.alert('Credenciales incorrectas.', 'Error');
          },
        });
    }
  }
  exitApp() {
    App.exitApp(); // Closes the application
  }
}
