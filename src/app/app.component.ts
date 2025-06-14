// app.component.ts
import { Component, OnInit } from '@angular/core';
//import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor() {} //private authService: AuthService

  ngOnInit() {
    // if (this.authService.isTokenExpired()) {
    //   this.authService.logout();  // Logout if token expired
    // }
  }
}
