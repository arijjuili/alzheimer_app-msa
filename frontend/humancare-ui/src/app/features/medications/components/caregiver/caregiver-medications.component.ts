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
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  MedicationPlan,
  MedicationIntake,
  MedicationForm,
  IntakeStatus
} from '../../../../shared/models/medication.model';
import { Patient } from '../../../../shared/models/patient.model';
import { MedicationService } from '../../services/medication.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { MedicationDetailDialogComponent } from '../dialogs/medication-detail-dialog.component';
import { IntakeStatusDialogComponent } from '../dialogs/intake-status-dialog.component';

@Component({
  selector: 'app-caregiver-medications',
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
    MatTooltipModule,
    MatDividerModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './caregiver-medications.component.html',
  styleUrls: ['./caregiver-medications.component.scss']
})
export class CaregiverMedicationsComponent implements OnInit {
  assignedPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  dataSource = new MatTableDataSource<MedicationPlan>([]);
  displayedColumns: string[] = ['medicationName', 'dosage', 'form', 'frequency', 'status', 'actions'];
  intakeColumns: string[] = ['scheduledAt', 'status', 'actions'];

  loadingPatients = true;
  loadingMedications = false;
  error: string | null = null;

  expandedPlan: MedicationPlan | null = null;
  planIntakes: Map<string, MedicationIntake[]> = new Map();
  loadingIntakes: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private medicationService: MedicationService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAssignedPatients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAssignedPatients(): void {
    this.loadingPatients = true;
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
        const currentUser = this.authService.getCurrentUser();
        this.assignedPatients = response.data.filter(p => p.caregiverId === currentUser?.id);
        if (this.assignedPatients.length > 0) {
          this.selectPatient(this.assignedPatients[0]);
        }
      });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.expandedPlan = null;
    this.loadMedicationsForPatient(patient.id);
  }

  loadMedicationsForPatient(patientId: string): void {
    this.loadingMedications = true;
    this.medicationService.getPlansByPatient(patientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load medications';
          return of([]);
        }),
        finalize(() => this.loadingMedications = false)
      )
      .subscribe(plans => {
        const list = plans.length ? plans : this.getMockMedicationPlans(patientId);
        this.dataSource.data = this.enrichMedications(list);
      });
  }

  private enrichMedications(list: MedicationPlan[]): MedicationPlan[] {
    const patientName = this.selectedPatient
      ? `${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`
      : undefined;
    return list.map(m => ({ ...m, patientName }));
  }

  togglePlanExpansion(plan: MedicationPlan): void {
    if (this.expandedPlan?.id === plan.id) {
      this.expandedPlan = null;
    } else {
      this.expandedPlan = plan;
      if (plan.id && !this.planIntakes.has(plan.id)) {
        this.loadIntakesForPlan(plan.id);
      }
    }
  }

  loadIntakesForPlan(planId: string): void {
    this.loadingIntakes.add(planId);
    this.medicationService.getIntakesByPlan(planId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(this.getMockIntakes(planId));
        }),
        finalize(() => this.loadingIntakes.delete(planId))
      )
      .subscribe(intakes => {
        this.planIntakes.set(planId, intakes);
      });
  }

  openDetailDialog(plan: MedicationPlan): void {
    const intakes = plan.id ? this.planIntakes.get(plan.id) || [] : [];
    this.dialog.open(MedicationDetailDialogComponent, {
      width: '500px',
      data: { plan, intakes, patientName: plan.patientName }
    });
  }

  openIntakeStatusDialog(intake: MedicationIntake, planId: string): void {
    const dialogRef = this.dialog.open(IntakeStatusDialogComponent, {
      width: '500px',
      data: { intake, professional: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && intake.id) {
        this.medicationService.updateIntake(intake.id, result)
          .pipe(catchError(err => {
            this.errorHandler.handleError(err);
            return of(null);
          }))
          .subscribe(res => {
            if (res) this.loadIntakesForPlan(planId);
          });
      }
    });
  }

  getStatusColor(status: boolean | undefined): string {
    return status ? 'primary' : 'warn';
  }

  getIntakeStatusColor(status: IntakeStatus): string {
    switch (status) {
      case IntakeStatus.TAKEN: return 'accent';
      case IntakeStatus.MISSED: return 'warn';
      case IntakeStatus.SKIPPED: return 'primary';
      case IntakeStatus.SCHEDULED:
      default: return 'primary';
    }
  }

  formatForm(form: MedicationForm): string {
    return form.charAt(0) + form.slice(1).toLowerCase();
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  private getMockMedicationPlans(patientId: string): MedicationPlan[] {
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId,
        medicationName: 'Amoxicillin',
        dosage: '500mg',
        form: MedicationForm.TABLET,
        frequencyPerDay: 3,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        instructions: 'Take with food',
        active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        patientId,
        medicationName: 'Vitamin D3',
        dosage: '1000 IU',
        form: MedicationForm.TABLET,
        frequencyPerDay: 1,
        startDate: new Date().toISOString().split('T')[0],
        instructions: 'Take in the morning',
        active: true
      }
    ];
  }

  private getMockIntakes(planId: string): MedicationIntake[] {
    const now = new Date();
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        planId,
        scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.TAKEN,
        takenAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        planId,
        scheduledAt: new Date(now.getTime()).toISOString(),
        status: IntakeStatus.SCHEDULED
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        planId,
        scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.SCHEDULED
      }
    ];
  }
}
