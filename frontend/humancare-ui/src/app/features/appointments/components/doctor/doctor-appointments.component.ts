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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Appointment, AppointmentCreateRequest, AppointmentStatus } from '../../../../shared/models/appointment.model';
import { Patient } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { AppointmentManageDialogComponent, AppointmentManageDialogData } from './appointment-manage-dialog.component';
import { AppointmentStatusUpdateDialogComponent, AppointmentStatusUpdateDialogData } from './appointment-status-update-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  AppointmentCreateDialogComponent,
  AppointmentCreateDialogData
} from '../patient/dialogs/appointment-create-dialog.component';

type FilterTab = 'all' | 'today' | 'scheduled' | 'completed' | 'cancelled' | 'upcoming';
type ViewMode = 'list' | 'calendar';

interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

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
    MatButtonToggleModule,
    DateFormatPipe
  ],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.scss']
})
export class DoctorAppointmentsComponent implements OnInit {
  dataSource = new MatTableDataSource<Appointment & { patientName?: string }>([]);
  displayedColumns: string[] = ['appointmentDate', 'patientName', 'reason', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');
  uuidSearchControl = new FormControl('');
  activeFilter: FilterTab = 'all';
  viewMode: ViewMode = 'list';
  calendarMonth = new Date();
  calendarDays: CalendarDay[] = [];
  doctorPatients: Patient[] = [];
  patientMap = new Map<string, Patient>();

  // Pagination
  totalAppointments = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  AppointmentStatus = AppointmentStatus;
  FilterTab = {
    ALL: 'all' as FilterTab,
    TODAY: 'today' as FilterTab,
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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDoctorPatients();
    this.setupSearch();
    this.setupUuidSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadDoctorPatients(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Could not identify current user';
      this.loading = false;
      return;
    }
    this.patientService.getPatients(1, 1000)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load assigned patients';
          return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 } as any);
        })
      )
      .subscribe(response => {
        this.doctorPatients = (response.data || []).filter((p: Patient) => p.doctorId === currentUser.id);
        this.doctorPatients.forEach(p => this.patientMap.set(p.id, p));
        this.loadAppointments();
      });
  }

  private enrichAppointments(appointments: Appointment[]): (Appointment & { patientName?: string })[] {
    return appointments.map(a => ({
      ...a,
      patientName: this.getPatientName(a.patientId)
    }));
  }

  private filterDoctorAppointments(appointments: Appointment[]): Appointment[] {
    const allowedIds = new Set(this.doctorPatients.map(p => p.id));
    return appointments.filter(a => allowedIds.has(a.patientId));
  }

  getPatientName(patientId: string): string {
    const patient = this.patientMap.get(patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : patientId;
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
        const filtered = this.filterDoctorAppointments(appointments);
        this.dataSource.data = this.enrichAppointments(filtered);
        this.totalAppointments = this.dataSource.data.length;
        this.applyFilter();
        this.buildCalendar();
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

  setupUuidSearch(): void {
    this.uuidSearchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(uuid => {
        if (!uuid || uuid.trim().length === 0) {
          this.loadAppointments();
          return;
        }
        this.searchByUuid(uuid.trim());
      });
  }

  searchByUuid(uuid: string): void {
    this.loading = true;
    this.error = null;
    this.appointmentService.getAppointmentById(uuid)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Appointment not found';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
        if (result && this.patientMap.has(result.patientId)) {
          this.dataSource.data = this.enrichAppointments([result]);
          this.totalAppointments = 1;
        } else {
          this.dataSource.data = [];
          this.totalAppointments = 0;
          if (result && !this.patientMap.has(result.patientId)) {
            this.error = 'Appointment not found or not authorized';
          }
        }
        this.buildCalendar();
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
    if (filter === 'upcoming') {
      this.loadUpcoming();
      return;
    }
    if (filter === 'all') {
      this.loadAppointments();
      return;
    }
    this.applyFilter();
  }

  loadByStatus(status: AppointmentStatus): void {
    this.loading = true;
    this.appointmentService.getAppointmentsByStatus(status)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to filter appointments';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(appointments => {
        const filtered = this.filterDoctorAppointments(appointments);
        this.dataSource.data = this.enrichAppointments(filtered);
        this.totalAppointments = this.dataSource.data.length;
        this.buildCalendar();
      });
  }

  loadUpcoming(): void {
    this.loading = true;
    this.appointmentService.getUpcomingAppointments()
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load upcoming appointments';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(appointments => {
        const filtered = this.filterDoctorAppointments(appointments);
        this.dataSource.data = this.enrichAppointments(filtered);
        this.totalAppointments = this.dataSource.data.length;
        this.buildCalendar();
      });
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
      case 'upcoming':
        filteredData = filteredData
          .filter(a => a.status === AppointmentStatus.SCHEDULED)
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        break;
      default:
        break;
    }

    this.dataSource.data = filteredData;
    this.totalAppointments = filteredData.length;
    this.buildCalendar();
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

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    if (mode === 'calendar') {
      this.buildCalendar();
    }
  }

  buildCalendar(): void {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        appointments: [],
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        appointments: this.dataSource.data.filter(a => this.isSameDay(new Date(a.appointmentDate), date)),
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today)
      });
    }

    // Next month padding to fill 6 rows (42 cells)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        appointments: [],
        isCurrentMonth: false,
        isToday: false
      });
    }

    this.calendarDays = days;
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  prevMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendar();
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
    const currentUser = this.authService.getCurrentUser();
    const doctorName = currentUser ? `Dr. ${currentUser.firstName} ${currentUser.lastName}` : '';
    const dialogRef = this.dialog.open(AppointmentCreateDialogComponent, {
      width: '600px',
      data: {
        doctorName,
        patients: this.doctorPatients,
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
        message: `Are you sure you want to delete this appointment for ${(appointment as any).patientName || appointment.patientId}? This action cannot be undone.`,
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
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

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
        appointmentDate: formatDate(nextWeek, 9),
        reason: 'Routine checkup',
        status: AppointmentStatus.SCHEDULED,
        notes: ''
      }
    ];
  }
}
