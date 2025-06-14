import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class NgrokSkipBrowserWarningInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: { 'ngrok-skip-browser-warning': 'true' },
    });
    return next.handle(request);
  }
}
