import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

import { DailyCheckin, MoodType, SleepQuality } from '../../../../shared/models/checkin.model';
import { CheckinService } from '../../services/checkin.service';
import { PatientService } from '../../../profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CheckinCreateDialogComponent } from './dialogs/checkin-create-dialog.component';
import { CheckinDetailDialogComponent } from '../dialogs/checkin-detail-dialog.component';

@Component({
  selector: 'app-patient-checkins',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './patient-checkins.component.html',
  styleUrls: ['./patient-checkins.component.scss']
})
export class PatientCheckinsComponent implements OnInit {
  todaysCheckin: DailyCheckin | null = null;
  pastCheckins: DailyCheckin[] = [];
  loading = false;
  currentPatientId: string | null = null;
  error: string | null = null;

  constructor(
    private checkinService: CheckinService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      this.currentPatientId = patient?.id || this.authService.getCurrentUser()?.id || null;
      this.loadCheckins();
    });
  }

  loadCheckins(): void {
    if (!this.currentPatientId) {
      this.error = 'Patient ID not found';
      return;
    }

    this.loading = true;
    this.error = null;

    forkJoin({
      today: this.checkinService.getTodaysCheckin(this.currentPatientId).pipe(
        catchError(err => {
          if (err.status !== 404 && err.status !== 401) {
            this.errorHandler.handleError(err);
          }
          return of(null);
        })
      ),
      past: this.checkinService.getCheckinsByPatient(this.currentPatientId, 0, 20).pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load check-ins';
          return of([]);
        })
      )
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe(({ today, past }) => {
      this.todaysCheckin = today;
      const todayStr = new Date().toISOString().split('T')[0];
      this.pastCheckins = past.filter(c => c.checkinDate !== todayStr);
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CheckinCreateDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { patientId: this.currentPatientId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCheckins();
      }
    });
  }

  openDetailDialog(checkin: DailyCheckin): void {
    this.dialog.open(CheckinDetailDialogComponent, {
      width: '500px',
      data: checkin
    });
  }

  deleteCheckin(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Check-in',
        message: 'Are you sure you want to delete this check-in? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.checkinService.deleteCheckin(id)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(null);
            })
          )
          .subscribe(deleteResult => {
            if (deleteResult !== null) {
              this.loadCheckins();
            }
          });
      }
    });
  }

  getMoodColor(mood: MoodType): string {
    switch (mood) {
      case MoodType.EXCELLENT: return 'primary';
      case MoodType.GOOD: return 'accent';
      case MoodType.FAIR: return '';
      case MoodType.POOR: return 'warn';
      case MoodType.BAD: return 'warn';
      default: return '';
    }
  }

  getSleepColor(sleep: SleepQuality): string {
    switch (sleep) {
      case SleepQuality.GREAT: return 'primary';
      case SleepQuality.GOOD: return 'accent';
      case SleepQuality.FAIR: return '';
      case SleepQuality.POOR: return 'warn';
      case SleepQuality.BAD: return 'warn';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
