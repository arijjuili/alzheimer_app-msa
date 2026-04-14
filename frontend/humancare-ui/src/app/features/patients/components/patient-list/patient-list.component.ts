import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Caregiver, Doctor, Patient } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { PatientCreateDialogComponent } from '../patient-create-dialog/patient-create-dialog.component';
import { PatientAssignmentDialogComponent } from '../patient-assignment-dialog/patient-assignment-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type UserTab = 'patients' | 'caregivers' | 'doctors';

@Component({
  selector: 'app-patient-list',
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
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    DateFormatPipe,
    InitialsPipe
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly tabs: Array<{ key: UserTab; label: string; icon: string }> = [
    { key: 'patients', label: 'Patients', icon: 'personal_injury' },
    { key: 'caregivers', label: 'Caregivers', icon: 'volunteer_activism' },
    { key: 'doctors', label: 'Doctors', icon: 'medical_services' }
  ];

  readonly patientColumns = ['name', 'email', 'phone', 'dateOfBirth', 'caregiver', 'doctor', 'actions'];
  readonly caregiverColumns = ['name', 'email', 'username', 'status'];
  readonly doctorColumns = ['name', 'email', 'username', 'status'];

  activeTab: UserTab = 'patients';
  loading = true;
  error: string | null = null;

  patients: Patient[] = [];
  caregivers: Caregiver[] = [];
  doctors: Doctor[] = [];
  filteredPatients: Patient[] = [];
  filteredCaregivers: Caregiver[] = [];
  filteredDoctors: Doctor[] = [];

  private doctorDirectory = new Map<string, Doctor>();
  private caregiverDirectory = new Map<string, Caregiver>();

  constructor(
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDirectory();
    this.setupSearch();
  }

  get totalUsers(): number {
    return this.patients.length + this.caregivers.length + this.doctors.length;
  }

  get canManageUsers(): boolean {
    return this.isAdmin();
  }

  loadDirectory(): void {
    this.loading = true;
    this.error = null;

    const requests = this.isAdmin()
      ? forkJoin({
          patients: this.patientService.getPatients(1, 1000),
          caregivers: this.patientService.getAvailableCaregivers(),
          doctors: this.patientService.getAvailableDoctors()
        })
      : forkJoin({
          patients: this.patientService.getPatients(1, 1000),
          caregivers: of([] as Caregiver[]),
          doctors: of([] as Doctor[])
        });

    requests
      .pipe(
        catchError(error => {
          this.errorHandler.handleError(error);
          this.error = 'Failed to load the user directory';
          return of({
            patients: { data: [], total: 0, page: 1, limit: 1000, totalPages: 0 },
            caregivers: [],
            doctors: []
          });
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(result => {
        this.patients = result.patients.data ?? [];
        this.caregivers = result.caregivers ?? [];
        this.doctors = result.doctors ?? [];

        this.doctorDirectory = new Map(this.doctors.map(doctor => [doctor.id, doctor]));
        this.caregiverDirectory = new Map(this.caregivers.map(caregiver => [caregiver.id, caregiver]));

        this.applySearch();
      });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => this.applySearch());
  }

  onTabChange(index: number): void {
    this.activeTab = this.tabs[index]?.key ?? 'patients';
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(PatientCreateDialogComponent, {
      width: '880px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        title: 'Add New User'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadDirectory();
      }
    });
  }

  openAssignmentDialog(patient: Patient, event?: Event): void {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(PatientAssignmentDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: {
        patient,
        caregivers: this.caregivers,
        doctors: this.doctors
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadDirectory();
      }
    });
  }

  viewPatient(patient: Patient, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/app', 'patients', patient.id]);
  }

  editPatient(patient: Patient, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/app', 'patients', patient.id, 'edit']);
  }

  deletePatient(patient: Patient, event?: Event): void {
    event?.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Patient',
        message: `Delete ${patient.firstName} ${patient.lastName}? This removes the patient profile and linked user account.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.errorHandler.showSuccess('Patient deleted successfully');
          this.loadDirectory();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        }
      });
    });
  }

  getDoctorDisplay(patient: Patient): string {
    if (!patient.doctorId) {
      return 'Unassigned';
    }

    if (patient.doctorName) {
      return `Dr. ${patient.doctorName}`;
    }

    const doctor = this.doctorDirectory.get(patient.doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Assigned';
  }

  getCaregiverDisplay(patient: Patient): string {
    if (!patient.caregiverId) {
      return 'Unassigned';
    }

    if (patient.caregiverName) {
      return patient.caregiverName;
    }

    const caregiver = this.caregiverDirectory.get(patient.caregiverId);
    return caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'Assigned';
  }

  getStatusTone(enabled?: boolean): string {
    return enabled === false ? 'offline' : 'online';
  }

  canEditPatient(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  canAssignPatient(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  private applySearch(): void {
    const query = this.searchControl.value.trim().toLowerCase();

    this.filteredPatients = this.patients.filter(patient => this.matchesPatient(patient, query));
    this.filteredCaregivers = this.caregivers.filter(caregiver => this.matchesDirectoryUser(caregiver, query));
    this.filteredDoctors = this.doctors.filter(doctor => this.matchesDirectoryUser(doctor, query));
  }

  private matchesPatient(patient: Patient, query: string): boolean {
    if (!query) {
      return true;
    }

    return [
      patient.firstName,
      patient.lastName,
      patient.email,
      patient.phone,
      this.getDoctorDisplay(patient),
      this.getCaregiverDisplay(patient)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  }

  private matchesDirectoryUser(user: Caregiver | Doctor, query: string): boolean {
    if (!query) {
      return true;
    }

    return [
      user.firstName,
      user.lastName,
      user.email,
      user.username
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  }
}
