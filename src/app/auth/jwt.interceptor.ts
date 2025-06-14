import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // Intercept outgoing HTTP requests
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    console.log('request url', request.url);

    return this.authService.getToken().pipe(
      // Use switchMap to wait for the token to be retrieved
      switchMap((token) => {
        console.log('jwtinterceptor is activated and the token is: ', token);
        if (token) {
          // Clone the request and add the Authorization header
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        return next.handle(request);
      }),
    );
  }
}
