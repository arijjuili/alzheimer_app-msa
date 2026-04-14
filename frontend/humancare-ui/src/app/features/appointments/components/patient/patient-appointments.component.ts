import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Appointment, AppointmentStatus, AppointmentCreateRequest } from '../../../../shared/models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../../profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AppointmentDetailDialogComponent } from './dialogs/appointment-detail-dialog.component';
import { AppointmentCreateDialogComponent } from './dialogs/appointment-create-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = ['date', 'doctor', 'reason', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  patientId: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      this.patientId = patient?.id || this.authService.getCurrentUser()?.id || null;
      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    if (!this.patientId) {
      this.error = 'Patient ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointmentsByPatient(this.patientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load appointments';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(appointments => {
        // If API returns empty data, use mock data for demo
        if (appointments.length === 0) {
          this.dataSource.data = this.getMockAppointments();
        } else {
          this.dataSource.data = appointments;
        }
      });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AppointmentCreateDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createAppointment(result);
      }
    });
  }

  openDetailDialog(appointment: Appointment): void {
    this.dialog.open(AppointmentDetailDialogComponent, {
      width: '500px',
      data: appointment
    });
  }

  createAppointment(appointmentData: Partial<AppointmentCreateRequest>): void {
    if (!this.patientId) return;

    const newAppointment: AppointmentCreateRequest = {
      patientId: this.patientId,
      doctorName: appointmentData.doctorName || '',
      appointmentDate: appointmentData.appointmentDate || '',
      reason: appointmentData.reason || '',
      status: AppointmentStatus.SCHEDULED,
      notes: appointmentData.notes
    };

    this.appointmentService.createAppointment(newAppointment)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.loadAppointments();
        }
      });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status !== AppointmentStatus.SCHEDULED) return;

    const updatedAppointment = {
      status: AppointmentStatus.CANCELLED
    };

    this.appointmentService.updateAppointment(appointment.id, updatedAppointment)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.loadAppointments();
        }
      });
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED;
  }

  canDelete(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED;
  }

  deleteAppointment(appointment: Appointment): void {
    if (appointment.status !== AppointmentStatus.SCHEDULED) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Appointment',
        message: 'Are you sure you want to delete this appointment? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.deleteAppointment(appointment.id)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(null);
            })
          )
          .subscribe(result => {
            if (result !== null) {
              this.loadAppointments();
            }
          });
      }
    });
  }

  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'primary';
      case AppointmentStatus.COMPLETED:
        return 'accent';
      case AppointmentStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getMockAppointments(): Appointment[] {
    const now = new Date();
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Annual checkup',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Please bring your insurance card and list of current medications.'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
        doctorName: 'Dr. Michael Chen',
        appointmentDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Follow-up consultation',
        status: AppointmentStatus.COMPLETED,
        notes: 'Blood pressure is stable. Continue current medication.'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
        doctorName: 'Dr. Emily Davis',
        appointmentDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Lab results review',
        status: AppointmentStatus.SCHEDULED,
        notes: ''
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
        doctorName: 'Dr. Robert Wilson',
        appointmentDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Routine physical',
        status: AppointmentStatus.CANCELLED,
        notes: 'Cancelled due to patient illness'
      }
    ];
  }
}
