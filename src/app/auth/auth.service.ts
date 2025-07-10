import { Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { API } from '../constants/API';
import { from, map, Observable, tap } from 'rxjs';
import { StorageService } from '../utils/storage.service';
import { jwtDecode } from 'jwt-decode';
export interface LoginResponse {
  user: any;
  access_token: string;
}
interface DecodedToken {
  idUser: number;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${API}/auth`;
  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, {
        email,
        password,
      })
      .pipe(
        tap((value) => {
          this.storageService.set('token', value.access_token);
          this.storageService.set('user', value.user);
        })
      );
  }
  logout() {
    this.storageService.clear();
    this.router.navigate(['auth/login']);
  }
  getUser(): Observable<any> {
    return from(this.storageService.get('user'));
  }
  getToken(): Observable<string | null> {
    return from(this.storageService.get('token'));
  }
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Math.floor(new Date().getTime() / 1000);
      console.log(decoded.exp - now);
      return decoded.exp - now < 3; // Refresh if token will expire in the next 3 seconds
    } catch (error) {
      return true; // Consider the token invalid if decoding fails
    }
  }
}
