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
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AppointmentService } from '../../services/appointment.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Appointment, AppointmentCreateRequest, AppointmentStatus } from '../../../../shared/models/appointment.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { AppointmentManageDialogComponent, AppointmentManageDialogData } from './appointment-manage-dialog.component';
import { AppointmentStatusUpdateDialogComponent, AppointmentStatusUpdateDialogData } from './appointment-status-update-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { 
  AppointmentCreateDialogComponent, 
  AppointmentCreateDialogData 
} from '../patient/dialogs/appointment-create-dialog.component';

type FilterTab = 'all' | 'today' | 'scheduled' | 'completed' | 'cancelled';

@Component({
  selector: 'app-doctor-appointments',
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
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.scss']
})
export class DoctorAppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = ['appointmentDate', 'patientId', 'doctorName', 'reason', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');
  activeFilter: FilterTab = 'all';
  
  // Pagination
  totalAppointments = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose enum to template
  AppointmentStatus = AppointmentStatus;
  FilterTab = {
    ALL: 'all' as FilterTab,
    TODAY: 'today' as FilterTab,
    SCHEDULED: 'scheduled' as FilterTab,
    COMPLETED: 'completed' as FilterTab,
    CANCELLED: 'cancelled' as FilterTab
  };

  constructor(
    private appointmentService: AppointmentService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAllAppointments()
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
        this.totalAppointments = this.dataSource.data.length;
        this.applyFilter();
      });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.applySearch(query || '');
      });
  }

  onFilterChange(filter: FilterTab): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filteredData = [...this.dataSource.data];

    switch (this.activeFilter) {
      case 'today':
        filteredData = filteredData.filter(a => this.isToday(a.appointmentDate));
        break;
      case 'scheduled':
        filteredData = filteredData.filter(a => a.status === AppointmentStatus.SCHEDULED);
        break;
      case 'completed':
        filteredData = filteredData.filter(a => a.status === AppointmentStatus.COMPLETED);
        break;
      case 'cancelled':
        filteredData = filteredData.filter(a => a.status === AppointmentStatus.CANCELLED);
        break;
      default:
        // 'all' - no filter
        break;
    }

    this.dataSource.data = filteredData;
    this.totalAppointments = filteredData.length;
  }

  applySearch(query: string): void {
    this.dataSource.filter = query.trim().toLowerCase();
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
        return 'default';
    }
  }

  onViewAppointment(appointment: Appointment): void {
    this.dialog.open(AppointmentManageDialogComponent, {
      width: '600px',
      data: { appointment, mode: 'view' } as AppointmentManageDialogData
    });
  }

  onEditAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentManageDialogComponent, {
      width: '600px',
      data: { appointment, mode: 'edit' } as AppointmentManageDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  onUpdateStatus(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentStatusUpdateDialogComponent, {
      width: '400px',
      data: { appointment } as AppointmentStatusUpdateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(AppointmentCreateDialogComponent, {
      width: '600px',
      data: {} as AppointmentCreateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add patientId if not provided (doctor must specify)
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
          .subscribe(createdAppointment => {
            if (createdAppointment) {
              this.loadAppointments();
            }
          });
      }
    });
  }

  onDeleteAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Appointment',
        message: `Are you sure you want to delete this appointment for patient ID ${appointment.patientId}? This action cannot be undone.`,
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
              return of(void 0);
            })
          )
          .subscribe(() => {
            this.loadAppointments();
          });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSort(sort: Sort): void {
    this.dataSource.sort = this.sort;
  }

  private getMockAppointments(): Appointment[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date: Date, hour: number): string => {
      const d = new Date(date);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };

    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId: '550e8400-e29b-41d4-a716-446655440101',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: formatDate(today, 9),
        reason: 'Annual physical examination',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Patient requested morning slot'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        patientId: '550e8400-e29b-41d4-a716-446655440102',
        doctorName: 'Dr. Michael Chen',
        appointmentDate: formatDate(today, 11),
        reason: 'Follow-up consultation',
        status: AppointmentStatus.COMPLETED,
        notes: 'Blood pressure stable'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        patientId: '550e8400-e29b-41d4-a716-446655440103',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: formatDate(tomorrow, 14),
        reason: 'Cardiology checkup',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Bring previous ECG reports'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        patientId: '550e8400-e29b-41d4-a716-446655440104',
        doctorName: 'Dr. Emily Davis',
        appointmentDate: formatDate(yesterday, 10),
        reason: 'Diabetes monitoring',
        status: AppointmentStatus.CANCELLED,
        notes: 'Patient cancelled - family emergency'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        patientId: '550e8400-e29b-41d4-a716-446655440105',
        doctorName: 'Dr. Michael Chen',
        appointmentDate: formatDate(today, 15),
        reason: 'Vaccination',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Flu shot scheduled'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        patientId: '550e8400-e29b-41d4-a716-446655440106',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: formatDate(tomorrow, 9),
        reason: 'Routine checkup',
        status: AppointmentStatus.SCHEDULED,
        notes: ''
      }
    ];
  }
}
