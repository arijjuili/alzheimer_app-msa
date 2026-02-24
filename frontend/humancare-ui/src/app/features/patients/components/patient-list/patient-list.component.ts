import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { debounceTime, distinctUntilChanged, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { AssignmentConfirmDialogComponent } from '../assignment-confirm-dialog/assignment-confirm-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type FilterTab = 'all' | 'my-patients' | 'unassigned';

type FilterType = 'all' | 'my' | 'unassigned';

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
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    MatBadgeModule,
    DateFormatPipe,
    InitialsPipe
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  dataSource = new MatTableDataSource<Patient>([]);
  displayedColumns: string[] = ['name', 'email', 'phone', 'dateOfBirth', 'assignment', 'actions'];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');

  // Filter tabs
  activeTab: FilterTab = 'all';
  readonly tabs = [
    { key: 'all' as FilterTab, label: 'All Patients', icon: 'people' },
    { key: 'my-patients' as FilterTab, label: 'My Patients', icon: 'person_pin' },
    { key: 'unassigned' as FilterTab, label: 'Unassigned', icon: 'person_outline' }
  ];

  // Pagination
  totalPatients = 0;
  pageSize = 10;
  pageIndex = 0;

  // Assignment loading states
  assigningPatientId: string | null = null;

  // Filter and current doctor
  activeFilter: FilterType = 'all';
  currentDoctorId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCurrentDoctor();
    this.loadPatients();
    this.setupSearch();
  }

  private loadCurrentDoctor(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && (this.isDoctor() || this.isAdmin())) {
      this.currentDoctorId = currentUser.id;
    }
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;

    const loadMethod = this.getLoadMethod();

    loadMethod
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load patients';
          return of({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        // If API returns empty data, use mock data for demo
        if (response.data.length === 0 && this.activeTab === 'all') {
          this.dataSource.data = this.getMockPatients();
          this.totalPatients = this.dataSource.data.length;
        } else {
          this.dataSource.data = response.data;
          this.totalPatients = response.total;
        }
      });
  }

  private getLoadMethod() {
    // Use activeFilter if set, otherwise fall back to activeTab
    const filter = this.activeFilter !== 'all' ? this.activeFilter : this.mapTabToFilter(this.activeTab);

    switch (filter) {
      case 'my':
        if (this.currentDoctorId) {
          return this.patientService.getPatientsByDoctor(this.currentDoctorId, this.pageIndex + 1, this.pageSize);
        }
        // Fallback to all patients if no doctor ID
        return this.patientService.getPatients(this.pageIndex + 1, this.pageSize);
      case 'unassigned':
        return this.patientService.getUnassignedPatients(this.pageIndex + 1, this.pageSize);
      case 'all':
      default:
        return this.patientService.getPatients(this.pageIndex + 1, this.pageSize);
    }
  }

  private mapTabToFilter(tab: FilterTab): FilterType {
    switch (tab) {
      case 'my-patients': return 'my';
      case 'unassigned': return 'unassigned';
      case 'all':
      default: return 'all';
    }
  }

  /**
   * Set the active filter for patient list
   */
  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadPatients();
  }

  /**
   * Check if patient is assigned to current doctor
   */
  isMyPatient(patient: Patient): boolean {
    if (!this.currentDoctorId) return false;
    return patient.doctorId === this.currentDoctorId;
  }

  /**
   * Check if doctor can assign this patient
   */
  canAssign(patient: Patient): boolean {
    if (!this.canAssignPatient()) return false;
    if (patient.doctorId) return false; // Already assigned
    if (!this.currentDoctorId) return false;
    
    // Admin or Doctor can assign unassigned patients
    return this.isAdmin() || this.isDoctor();
  }

  onTabChange(tab: FilterTab): void {
    this.activeTab = tab;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadPatients();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query) {
          this.searchPatients(query);
        } else {
          this.loadPatients();
        }
      });
  }

  searchPatients(query: string): void {
    this.loading = true;
    
    // If searching by name (not email pattern), filter locally
    if (this.isNameSearch(query)) {
      this.performLocalNameSearch(query);
    } else {
      // Use API search for other queries
      this.patientService.searchPatients(query)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of([]);
          }),
          finalize(() => this.loading = false)
        )
        .subscribe(patients => {
          this.dataSource.data = patients;
          this.totalPatients = patients.length;
        });
    }
  }

  private isNameSearch(query: string): boolean {
    // Simple heuristic: if query contains spaces or letters without special characters, treat as name
    return /^[a-zA-Z\s]+$/.test(query.trim());
  }

  private performLocalNameSearch(query: string): void {
    const lowerQuery = query.toLowerCase();
    
    // First load all patients if needed
    this.patientService.getPatients(1, 1000)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of({ 
            data: this.dataSource.data.length > 0 ? this.dataSource.data : this.getMockPatients(), 
            total: 0, page: 1, limit: 1000, totalPages: 0 
          });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        const allPatients = response.data.length > 0 ? response.data : this.getMockPatients();
        const filtered = allPatients.filter(patient => {
          const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          return fullName.includes(lowerQuery) ||
                 patient.firstName.toLowerCase().includes(lowerQuery) ||
                 patient.lastName.toLowerCase().includes(lowerQuery);
        });
        this.dataSource.data = filtered;
        this.totalPatients = filtered.length;
      });
  }

  onRowClick(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  onSort(sort: Sort): void {
    // In a real implementation, you would sort on the server side
    // or use MatTableDataSource's built-in sorting
    this.dataSource.sort = this.sort;
  }

  canCreatePatient(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  canEditPatient(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  canAssignPatient(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  isDoctor(): boolean {
    return this.authService.hasRole('DOCTOR');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  /**
   * Check if the current user can assign this specific patient to themselves
   */
  canAssignToMe(patient: Patient): boolean {
    if (!this.canAssignPatient()) return false;
    if (patient.doctorId) return false; // Already assigned
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Admin can assign any unassigned patient
    if (this.isAdmin()) return true;
    
    // Doctor can assign unassigned patients to themselves
    return this.isDoctor();
  }

  /**
   * Assign patient to current user (doctor)
   */
  assignToMe(patient: Patient, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.currentDoctorId) {
      this.errorHandler.showError('You must be logged in to perform this action');
      return;
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Assignment',
        message: `Assign ${patientName} to yourself?`,
        confirmButtonText: 'Assign',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'primary',
        icon: 'person_add'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performAssignment(patient.id, this.currentDoctorId!);
      }
    });
  }

  private performAssignment(patientId: string, doctorId: string): void {
    this.assigningPatientId = patientId;
    
    this.patientService.assignDoctor(patientId, doctorId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.assigningPatientId = null)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Patient successfully assigned to you');
          this.loadPatients(); // Refresh the list
        }
      });
  }

  /**
   * Get assignment status text for a patient
   */
  getAssignmentStatus(patient: Patient): { text: string; type: 'assigned' | 'unassigned' | 'self' } {
    const currentUser = this.authService.getCurrentUser();
    
    if (patient.doctorId) {
      if (currentUser && patient.doctorId === currentUser.id) {
        return { text: 'Assigned to Me', type: 'self' };
      }
      return { 
        text: `Dr. ${patient.doctorName || 'Unknown'}`, 
        type: 'assigned' 
      };
    }
    return { text: 'Unassigned', type: 'unassigned' };
  }

  private getMockPatients(): Patient[] {
    const currentUser = this.authService.getCurrentUser();
    const myId = currentUser?.id;

    return [
      {
        id: 'p1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1985-06-15',
        address: '123 Main St, City, State 12345',
        emergencyContact: 'Jane Doe - +1 (555) 987-6543',
        medicalHistory: 'No significant medical history',
        doctorId: myId,
        doctorName: 'Smith',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'p2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: '1990-03-22',
        address: '456 Oak Ave, Town, State 67890',
        emergencyContact: 'Bob Smith - +1 (555) 876-5432',
        medicalHistory: 'Allergic to penicillin',
        doctorId: 'd2',
        doctorName: 'Johnson',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'p3',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.j@example.com',
        phone: '+1 (555) 345-6789',
        dateOfBirth: '1978-11-08',
        address: '789 Pine Rd, Village, State 11111',
        emergencyContact: 'Mary Johnson - +1 (555) 765-4321',
        medicalHistory: 'Hypertension, takes medication daily',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'p4',
        firstName: 'Emily',
        lastName: 'Williams',
        email: 'emily.w@example.com',
        phone: '+1 (555) 456-7890',
        dateOfBirth: '1995-09-30',
        address: '321 Elm St, Hamlet, State 22222',
        emergencyContact: 'David Williams - +1 (555) 654-3210',
        medicalHistory: 'None',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'p5',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.b@example.com',
        phone: '+1 (555) 567-8901',
        dateOfBirth: '1982-07-14',
        address: '654 Maple Dr, City, State 33333',
        emergencyContact: 'Sarah Brown - +1 (555) 543-2109',
        medicalHistory: 'Asthma, uses inhaler as needed',
        doctorId: 'd3',
        doctorName: 'Davis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}
