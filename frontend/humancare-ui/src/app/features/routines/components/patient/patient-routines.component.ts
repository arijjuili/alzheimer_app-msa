import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Routine, RoutineFrequency } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-patient-routines',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-routines.component.html',
  styleUrls: ['./patient-routines.component.scss']
})
export class PatientRoutinesComponent implements OnInit {
  routines: Routine[] = [];
  loading = false;
  currentPatientId: string | null = null;

  constructor(
    private routineService: RoutineService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentPatientId = this.getPatientIdFromToken();
    this.loadRoutines();
  }

  getPatientIdFromToken(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.id || null;
  }

  loadRoutines(): void {
    if (!this.currentPatientId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.routineService.getRoutinesByPatient(this.currentPatientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(routines => {
        this.routines = routines;
      });
  }

  completeRoutine(routine: Routine): void {
    if (!routine.id || !routine.isActive) return;

    this.routineService.completeRoutine(routine.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.snackBar.open('Routine completed!', 'Close', { duration: 3000 });
          this.loadRoutines();
        }
      });
  }

  getFrequencyLabel(frequency: RoutineFrequency): string {
    switch (frequency) {
      case RoutineFrequency.DAILY:
        return 'Daily';
      case RoutineFrequency.WEEKLY:
        return 'Weekly';
      case RoutineFrequency.MONTHLY:
        return 'Monthly';
      default:
        return frequency;
    }
  }
}
