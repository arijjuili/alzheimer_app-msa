import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private keycloakService: KeycloakService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth for public endpoints
    if (this.isPublicEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add auth token to request if available
    const token = this.authService.getToken();
    
    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          // Handle 401 Unauthorized - Token expired or invalid
          if (error.status === 401) {
            return this.handle401Error(request, next);
          }
          
          // Handle 403 Forbidden - No permission
          if (error.status === 403) {
            console.error('Access forbidden:', error);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicEndpoint(url: string): boolean {
    const publicPatterns = [
      '/auth/login',
      '/auth/register',
      '/realms/',
      '/health',
      '/actuator/'
    ];
    return publicPatterns.some(pattern => url.includes(pattern));
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token) => {
          this.isRefreshing = false;
          if (token) {
            this.refreshTokenSubject.next(token);
            return next.handle(this.addTokenToRequest(request, token));
          }
          // Refresh failed - don't logout immediately, just return error
          // Let the user retry or navigate manually
          console.warn('Token refresh failed, user needs to re-authenticate');
          return throwError(() => new Error('Session expired. Please log in again.'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Don't automatically logout on refresh failure
          // This prevents unwanted redirects during data loading
          console.warn('Token refresh error:', error.message);
          return throwError(() => error);
        })
      );
    } else {
      // Wait for the token to be refreshed
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token!));
        })
      );
    }
  }
}
