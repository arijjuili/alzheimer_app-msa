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

import { MedicationService } from '../../services/medication.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Patient } from '../../../../shared/models/patient.model';
import {
  MedicationPlan,
  MedicationForm
} from '../../../../shared/models/medication.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { MedicationManageDialogComponent, MedicationManageDialogData } from './medication-manage-dialog.component';
import { MedicationIntakesDialogComponent, MedicationIntakesDialogData } from './medication-intakes-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MedicationCreateDialogComponent, MedicationCreateDialogData } from '../dialogs/medication-create-dialog.component';
import { MedicationPlanCreateRequest } from '../../../../shared/models/medication.model';

type FilterTab = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-doctor-medications',
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
  templateUrl: './doctor-medications.component.html',
  styleUrls: ['./doctor-medications.component.scss']
})
export class DoctorMedicationsComponent implements OnInit {
  dataSource = new MatTableDataSource<MedicationPlan>([]);
  displayedColumns: string[] = ['patientName', 'medicationName', 'dosage', 'form', 'frequency', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');
  activeFilter: FilterTab = 'all';
  patientIdFilter = new FormControl('');

  myPatients: Patient[] = [];
  allMedications: MedicationPlan[] = [];

  // Pagination
  totalMedications = 0;
  pageSize = 10;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose enums to template
  MedicationForm = MedicationForm;
  FilterTab = {
    ALL: 'all' as FilterTab,
    ACTIVE: 'active' as FilterTab,
    INACTIVE: 'inactive' as FilterTab
  };

  constructor(
    private medicationService: MedicationService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyPatients();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadMyPatients(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Doctor profile not found';
      this.loading = false;
      return;
    }

    this.patientService.getPatientsByDoctor(currentUser.id, 1, 1000)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load assigned patients';
          return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
        })
      )
      .subscribe(response => {
        this.myPatients = response.data;
        this.loadMedications();
      });
  }

  loadMedications(): void {
    this.loading = true;
    this.error = null;

    this.medicationService.getAllPlans()
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load medications';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(medications => {
        // Filter to doctor's assigned patients only; enrich with patient names
        const patientIds = new Set(this.myPatients.map(p => p.id));
        const filtered = medications.filter(m => patientIds.has(m.patientId));
        this.allMedications = this.enrichMedications(filtered.length ? filtered : this.getMockMedications());
        this.applyFilter();
        this.totalMedications = this.dataSource.data.length;
      });
  }

  private enrichMedications(list: MedicationPlan[]): MedicationPlan[] {
    return list.map(m => {
      const patient = this.myPatients.find(p => p.id === m.patientId);
      return {
        ...m,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : m.patientId
      } as any;
    });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        this.applySearch(query || '');
      });

    this.patientIdFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(patientId => {
        this.applyPatientIdFilter(patientId || '');
      });
  }

  onFilterChange(filter: FilterTab): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filteredData = [...this.allMedications];

    switch (this.activeFilter) {
      case 'active':
        filteredData = filteredData.filter(m => m.active !== false);
        break;
      case 'inactive':
        filteredData = filteredData.filter(m => m.active === false);
        break;
    }

    this.dataSource.data = filteredData;
    this.totalMedications = filteredData.length;
  }

  applySearch(query: string): void {
    const normalizedQuery = query.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchTerms = filter.toLowerCase().split(' ');
      const haystack = [
        data.medicationName,
        data.dosage,
        data.instructions || '',
        data.patientName || ''
      ].join(' ').toLowerCase();
      return searchTerms.every(term => haystack.includes(term));
    };
    this.dataSource.filter = normalizedQuery;
  }

  applyPatientIdFilter(patientId: string): void {
    if (!patientId.trim()) {
      this.applyFilter();
      return;
    }

    const id = patientId.trim();
    this.loading = true;
    this.medicationService.getPlansByPatient(id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load medications for patient';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(medications => {
        const filtered = medications.length ? medications : this.getMockMedications().filter(m => m.patientId === id);
        this.allMedications = this.enrichMedications(filtered);
        this.applyFilter();
      });
  }

  getFormLabel(form: MedicationForm): string {
    switch (form) {
      case MedicationForm.TABLET: return 'Tablet';
      case MedicationForm.SYRUP: return 'Syrup';
      case MedicationForm.INJECTION: return 'Injection';
      case MedicationForm.DROPS: return 'Drops';
      case MedicationForm.OTHER: return 'Other';
      default: return form;
    }
  }

  getStatusColor(active: boolean | undefined): string {
    return active !== false ? 'primary' : 'warn';
  }

  getStatusLabel(active: boolean | undefined): string {
    return active !== false ? 'Active' : 'Inactive';
  }

  isExpiringSoon(endDate: string | undefined): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return end <= threeDaysFromNow && end >= today;
  }

  onViewMedication(medication: MedicationPlan): void {
    this.dialog.open(MedicationManageDialogComponent, {
      width: '700px',
      data: { medication, mode: 'view', patientName: medication.patientName } as MedicationManageDialogData
    });
  }

  onEditMedication(medication: MedicationPlan): void {
    const dialogRef = this.dialog.open(MedicationManageDialogComponent, {
      width: '700px',
      data: { medication, mode: 'edit', patientName: medication.patientName } as MedicationManageDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadMedications();
    });
  }

  onViewIntakes(medication: MedicationPlan): void {
    this.dialog.open(MedicationIntakesDialogComponent, {
      width: '800px',
      data: { medication, patientName: medication.patientName } as MedicationIntakesDialogData
    });
  }

  onDeleteMedication(medication: MedicationPlan): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Medication Plan',
        message: `Are you sure you want to delete the medication plan for "${medication.medicationName}" for patient ${(medication as any).patientName || medication.patientId}? This action cannot be undone.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && medication.id) {
        this.medicationService.deletePlan(medication.id)
          .pipe(catchError(err => { this.errorHandler.handleError(err); return of(void 0); }))
          .subscribe(() => this.loadMedications());
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MedicationCreateDialogComponent, {
      width: '600px',
      data: { patients: this.myPatients, professional: true } as MedicationCreateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newPlan: MedicationPlanCreateRequest = {
          ...result,
          patientId: result.patientId
        };
        this.medicationService.createPlan(newPlan)
          .pipe(catchError(err => { this.errorHandler.handleError(err); return of(null); }))
          .subscribe(createdPlan => {
            if (createdPlan) this.loadMedications();
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

  private getMockMedications(): MedicationPlan[] {
    const today = new Date();
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId: this.myPatients[0]?.id || '550e8400-e29b-41d4-a716-446655440101',
        medicationName: 'Amoxicillin',
        dosage: '500mg',
        form: MedicationForm.TABLET,
        frequencyPerDay: 3,
        startDate: today.toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: 'Take with food',
        active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        patientId: this.myPatients[1]?.id || '550e8400-e29b-41d4-a716-446655440102',
        medicationName: 'Insulin',
        dosage: '10 units',
        form: MedicationForm.INJECTION,
        frequencyPerDay: 2,
        startDate: today.toISOString().split('T')[0],
        instructions: 'Before meals',
        active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        patientId: this.myPatients[2]?.id || '550e8400-e29b-41d4-a716-446655440103',
        medicationName: 'Cough Syrup',
        dosage: '10ml',
        form: MedicationForm.SYRUP,
        frequencyPerDay: 4,
        startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: false
      }
    ];
  }
}
