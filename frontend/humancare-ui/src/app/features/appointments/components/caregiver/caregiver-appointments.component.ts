import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { catchError, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';

import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { NotificationTriggerService } from '../../../../shared/services/notification-trigger.service';
import { Appointment, AppointmentCreateRequest, AppointmentStatus } from '../../../../shared/models/appointment.model';
import { Patient } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { AppointmentDetailDialogComponent } from '../patient/dialogs/appointment-detail-dialog.component';
import { AppointmentCreateDialogComponent, AppointmentCreateDialogData } from '../patient/dialogs/appointment-create-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type FilterTab = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'upcoming';

@Component({
  selector: 'app-caregiver-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    MatSelectModule,
    DateFormatPipe
  ],
  templateUrl: './caregiver-appointments.component.html',
  styleUrls: ['./caregiver-appointments.component.scss']
})
export class CaregiverAppointmentsComponent implements OnInit {
  // Patients
  assignedPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  loadingPatients = true;

  // Appointments
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = ['appointmentDate', 'doctorName', 'reason', 'status', 'actions'];
  loadingAppointments = false;
  error: string | null = null;
  activeFilter: FilterTab = 'all';

  // UUID Search
  uuidSearchControl = new FormControl('');

  // Pagination
  totalAppointments = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  AppointmentStatus = AppointmentStatus;
  FilterTab = {
    ALL: 'all' as FilterTab,
    SCHEDULED: 'scheduled' as FilterTab,
    COMPLETED: 'completed' as FilterTab,
    CANCELLED: 'cancelled' as FilterTab,
    UPCOMING: 'upcoming' as FilterTab
  };

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog,
    private notificationTrigger: NotificationTriggerService
  ) {}

  ngOnInit(): void {
    this.loadAssignedPatients();
    this.setupUuidSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadAssignedPatients(): void {
    this.loadingPatients = true;
    const currentUser = this.authService.getCurrentUser();
    const caregiverId = currentUser?.id;

    this.patientService.getPatients(1, 1000)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load patients';
          return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
        }),
        finalize(() => this.loadingPatients = false)
      )
      .subscribe(response => {
        this.assignedPatients = caregiverId
          ? response.data.filter(p => p.caregiverId === caregiverId)
          : response.data;
        if (this.assignedPatients.length > 0 && !this.selectedPatient) {
          this.selectPatient(this.assignedPatients[0]);
        }
      });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.activeFilter = 'all';
    this.uuidSearchControl.setValue('');
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (!this.selectedPatient) {
      this.dataSource.data = [];
      return;
    }
    this.loadingAppointments = true;
    this.error = null;

    this.appointmentService.getAppointmentsByPatient(this.selectedPatient.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load appointments';
          return of([]);
        }),
        finalize(() => this.loadingAppointments = false)
      )
      .subscribe(appointments => {
        this.dataSource.data = appointments;
        this.totalAppointments = appointments.length;
        this.applyFilter();
      });
  }

  setupUuidSearch(): void {
    this.uuidSearchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(uuid => {
        if (!uuid || uuid.trim().length === 0) {
          if (this.selectedPatient) {
            this.loadAppointments();
          }
          return;
        }
        this.searchByUuid(uuid.trim());
      });
  }

  searchByUuid(uuid: string): void {
    this.loadingAppointments = true;
    this.error = null;
    this.appointmentService.getAppointmentById(uuid)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Appointment not found';
          return of(null);
        }),
        finalize(() => this.loadingAppointments = false)
      )
      .subscribe(result => {
        if (result) {
          this.dataSource.data = [result];
          this.totalAppointments = 1;
        } else {
          this.dataSource.data = [];
          this.totalAppointments = 0;
        }
      });
  }

  onFilterChange(filter: FilterTab): void {
    this.activeFilter = filter;
    if (filter === 'scheduled' || filter === 'completed' || filter === 'cancelled') {
      const statusMap: Record<string, AppointmentStatus> = {
        scheduled: AppointmentStatus.SCHEDULED,
        completed: AppointmentStatus.COMPLETED,
        cancelled: AppointmentStatus.CANCELLED
      };
      this.loadByStatus(statusMap[filter]);
      return;
    }
    this.applyFilter();
  }

  loadByStatus(status: AppointmentStatus): void {
    this.loadingAppointments = true;
    this.appointmentService.getAppointmentsByStatus(status)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to filter appointments';
          return of([]);
        }),
        finalize(() => this.loadingAppointments = false)
      )
      .subscribe(appointments => {
        // Further restrict to selected patient if one is selected
        if (this.selectedPatient) {
          appointments = appointments.filter(a => a.patientId === this.selectedPatient!.id);
        }
        this.dataSource.data = appointments;
        this.totalAppointments = appointments.length;
      });
  }

  applyFilter(): void {
    let filtered = [...this.dataSource.data];
    switch (this.activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(a => a.status === AppointmentStatus.SCHEDULED)
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        break;
      default:
        // 'all' - no filter
        break;
    }
    this.dataSource.data = filtered;
    this.totalAppointments = filtered.length;
  }

  openCreateDialog(): void {
    if (!this.selectedPatient) return;
    const dialogRef = this.dialog.open(AppointmentCreateDialogComponent, {
      width: '600px',
      data: {
        patientId: this.selectedPatient.id,
        doctorName: this.selectedPatient.doctorName || '',
        hideDoctor: true,
        patients: [this.selectedPatient],
        professional: true
      } as AppointmentCreateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newAppointment: AppointmentCreateRequest = {
          ...result,
          status: AppointmentStatus.SCHEDULED
        };
        this.appointmentService.createAppointment(newAppointment)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(null);
            })
          )
          .subscribe(created => {
            if (created) {
              const caregiver = this.authService.getCurrentUser();
              const patientName = this.selectedPatient
                ? `${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`
                : 'your patient';
              const recipients: string[] = [];
              if (created.patientId) recipients.push(created.patientId);
              if (this.selectedPatient?.doctorId) recipients.push(this.selectedPatient.doctorId);
              this.notificationTrigger.appointmentScheduled(
                recipients,
                patientName,
                caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'A caregiver'
              );
              this.loadAppointments();
            }
          });
      }
    });
  }

  openDetailDialog(appointment: Appointment): void {
    this.dialog.open(AppointmentDetailDialogComponent, {
      width: '500px',
      data: appointment
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status !== AppointmentStatus.SCHEDULED) return;
    this.appointmentService.updateAppointment(appointment.id, { status: AppointmentStatus.CANCELLED })
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) this.loadAppointments();
      });
  }

  deleteAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Appointment',
        message: 'Are you sure you want to delete this appointment?',
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
          .subscribe(() => this.loadAppointments());
      }
    });
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED;
  }

  canDelete(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED;
  }

  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'primary';
      case AppointmentStatus.COMPLETED: return 'accent';
      case AppointmentStatus.CANCELLED: return 'warn';
      default: return '';
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
