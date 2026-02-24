import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse | Error | string): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error instanceof HttpErrorResponse) {
      // Server or connection error
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.status === 422) {
          errorMessage = error.error?.message || 'Validation failed. Please check your input.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Show snackbar notification
    this.showError(errorMessage);

    // Log error for debugging
    console.error('Error occurred:', error);

    return throwError(() => new Error(errorMessage));
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
