import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { DailyCheckin, MoodType, SleepQuality } from '../../../../shared/models/checkin.model';
import { Patient } from '../../../../shared/models/patient.model';
import { Role } from '../../../../shared/models/user.model';
import { CheckinService } from '../../services/checkin.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { CheckinDetailDialogComponent } from '../dialogs/checkin-detail-dialog.component';

@Component({
  selector: 'app-checkins-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './checkins-list.component.html',
  styleUrls: ['./checkins-list.component.scss']
})
export class CheckinsListComponent implements OnInit {
  dataSource = new MatTableDataSource<DailyCheckin & { patientName?: string }>([]);
  displayedColumns: string[] = ['checkinDate', 'patientName', 'mood', 'energyLevel', 'sleepQuality', 'actions'];
  loading = false;
  page = 0;
  size = 20;
  totalElements = 0;
  error: string | null = null;

  myPatients: Patient[] = [];
  selectedPatientId: string | null = null;
  isCaregiver = false;
  isDoctor = false;
  isAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private checkinService: CheckinService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    this.isCaregiver = roles.includes(Role.CAREGIVER);
    this.isDoctor = roles.includes(Role.DOCTOR);
    this.isAdmin = roles.includes(Role.ADMIN);
    this.loadMyPatients();
  }

  loadMyPatients(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.loadCheckins();
      return;
    }

    if (this.isDoctor) {
      this.patientService.getPatientsByDoctor(currentUser.id, 1, 1000)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
          })
        )
        .subscribe(response => {
          this.myPatients = response.data;
          this.loadCheckins();
        });
    } else if (this.isCaregiver) {
      this.patientService.getPatients(1, 1000)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
          })
        )
        .subscribe(response => {
          this.myPatients = response.data.filter(p => p.caregiverId === currentUser.id);
          this.loadCheckins();
        });
    } else {
      this.patientService.getPatients(1, 1000)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
          })
        )
        .subscribe(response => {
          this.myPatients = response.data;
          this.loadCheckins();
        });
    }
  }

  loadCheckins(): void {
    this.loading = true;
    this.error = null;

    this.checkinService.getAllCheckins(this.page, this.size)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load check-ins';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(checkins => {
        const patientIds = new Set(this.myPatients.map(p => p.id));
        let filtered = this.isAdmin ? checkins : checkins.filter(c => patientIds.has(c.patientId));
        const enriched = filtered.map(c => ({
          ...c,
          patientName: this.getPatientName(c.patientId)
        }));
        this.dataSource.data = enriched;
        if (enriched.length === this.size) {
          this.totalElements = (this.page + 1) * this.size + 1;
        } else {
          this.totalElements = this.page * this.size + enriched.length;
        }
      });
  }

  getPatientName(patientId: string): string {
    const patient = this.myPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : patientId;
  }

  onPatientFilterChange(patientId: string | null): void {
    this.selectedPatientId = patientId;
    if (!patientId) {
      this.loadCheckins();
      return;
    }
    this.loading = true;
    this.checkinService.getCheckinsByPatient(patientId, this.page, this.size)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load check-ins';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(checkins => {
        const enriched = checkins.map(c => ({
          ...c,
          patientName: this.getPatientName(c.patientId)
        }));
        this.dataSource.data = enriched;
        this.totalElements = enriched.length;
      });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadCheckins();
  }

  openDetailDialog(checkin: DailyCheckin): void {
    this.dialog.open(CheckinDetailDialogComponent, {
      width: '500px',
      data: checkin
    });
  }

  getMoodIcon(mood: MoodType): string {
    switch (mood) {
      case MoodType.EXCELLENT: return 'sentiment_very_satisfied';
      case MoodType.GOOD: return 'sentiment_satisfied';
      case MoodType.FAIR: return 'sentiment_neutral';
      case MoodType.POOR: return 'sentiment_dissatisfied';
      case MoodType.BAD: return 'sentiment_very_dissatisfied';
      default: return 'sentiment_neutral';
    }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
