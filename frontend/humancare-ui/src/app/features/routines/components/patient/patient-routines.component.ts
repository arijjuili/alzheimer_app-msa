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

import { Routine, RoutineFrequency, Page } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { PatientService } from '../../../profile/services/patient.service';
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
  today = new Date();

  constructor(
    private routineService: RoutineService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      this.currentPatientId = patient?.id || this.authService.getCurrentUser()?.id || null;
      this.loadRoutines();
    });
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
          return of({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 } as Page<Routine>);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(page => {
        this.routines = page.content;
      });
  }

  completeRoutine(routine: Routine): void {
    if (!routine.id || !routine.isActive) return;

    const today = new Date().toISOString().split('T')[0];
    if (routine.completed && routine.lastCompletedDate === today) {
      // Already completed today - allow uncomplete
      this.routineService.uncompleteRoutine(routine.id)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.snackBar.open('Routine unchecked', 'Close', { duration: 3000 });
            this.loadRoutines();
          }
        });
    } else {
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
  }

  isCompletedToday(routine: Routine): boolean {
    if (!routine.completed || !routine.lastCompletedDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return routine.lastCompletedDate === todayStr;
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
