import { Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { API } from '../constants/API';
import { from, map, Observable, tap } from 'rxjs';
import { StorageService } from '../utils/storage.service';
import { jwtDecode } from 'jwt-decode';

export interface ApiResponse<T = any> {
  result: T;
  statusCode: HttpStatusCode;
}
export interface LoginResponse {
  firstName: string;
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
    private router: Router,
  ) {}

  login(
    email: string,
    password: string,
  ): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, {
        email,
        password,
      })
      .pipe(
        tap((value) => {
          if (value.statusCode === HttpStatusCode.Ok) {
            this.storageService.set('auth.token', value.result.access_token);
            this.storageService.set('auth.user', value.result.firstName);
          }
        }),
      );
  }
  logout() {
    this.storageService.clear();
    this.router.navigate(['auth/login']);
  }
  getUserName(): Observable<string> {
    return from(this.storageService.get('auth.user'));
  }
  getToken(): Observable<string | null> {
    return from(this.storageService.get('auth.token'));
  }
  getIdUserFromToken(): Observable<number | null> {
    return this.getToken().pipe(
      map((token) => {
        if (!token) return null; // Handle the case when the token is null
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.idUser;
      }),
    );
  }
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(new Date().getTime() / 1000);
      console.log(decoded.exp - now);
      return decoded.exp - now < 3; // Refresh if token will expire in the next 3 seconds
    } catch (error) {
      return true; // Consider the token invalid if decoding fails
    }
  }
}
