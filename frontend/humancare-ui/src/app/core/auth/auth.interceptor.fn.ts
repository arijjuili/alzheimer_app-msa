import { HttpErrorResponse, HttpEvent, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const authInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((token) => {
        isRefreshing = false;
        if (token) {
          refreshTokenSubject.next(token);
          return next(req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          }));
        }
        // Don't auto-logout - let user retry or navigate manually
        console.warn('Token refresh failed, user needs to re-authenticate');
        return throwError(() => new Error('Session expired. Please log in again.'));
      }),
      catchError((error) => {
        isRefreshing = false;
        // Don't auto-logout - this prevents unwanted redirects during data loading
        console.warn('Token refresh error:', error.message);
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
