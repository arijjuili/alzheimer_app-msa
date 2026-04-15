import { Component, OnInit } from '@angular/core';
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
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  MedicationPlan,
  MedicationIntake,
  MedicationForm,
  IntakeStatus
} from '../../../../shared/models/medication.model';
import { MedicationService } from '../../services/medication.service';
import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { MedicationDetailDialogComponent } from '../dialogs/medication-detail-dialog.component';

@Component({
  selector: 'app-patient-medications',
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
    MatDividerModule
  ],
  templateUrl: './patient-medications.component.html',
  styleUrls: ['./patient-medications.component.scss']
})
export class PatientMedicationsComponent implements OnInit {
  dataSource = new MatTableDataSource<MedicationPlan>([]);
  displayedColumns: string[] = ['medicationName', 'dosage', 'form', 'frequency', 'status', 'actions'];
  intakeColumns: string[] = ['scheduledAt', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  patientId: string | null = null;
  patientName: string | undefined;
  expandedPlan: MedicationPlan | null = null;
  planIntakes: Map<string, MedicationIntake[]> = new Map();
  loadingIntakes: Set<string> = new Set();

  IntakeStatus = IntakeStatus;

  constructor(
    private medicationService: MedicationService,
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      this.patientId = patient?.id || null;
      this.patientName = patient ? `${patient.firstName} ${patient.lastName}` : undefined;
      this.loadMedications();
    });
  }

  loadMedications(): void {
    if (!this.patientId) {
      this.error = 'Patient ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.medicationService.getPlansByPatient(this.patientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load medications';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(plans => {
        this.dataSource.data = plans.length ? plans : this.getMockMedicationPlans();
      });
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
      data: { plan, intakes, gamified: true, patientName: this.patientName }
    });
  }

  markAsTaken(intake: MedicationIntake, planId: string): void {
    if (!intake.id) return;
    this.medicationService.markAsTaken(intake.id)
      .pipe(catchError(err => {
        this.errorHandler.handleError(err);
        return of(null);
      }))
      .subscribe(result => {
        if (result) {
          this.loadIntakesForPlan(planId);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatForm(form: MedicationForm): string {
    return form.charAt(0) + form.slice(1).toLowerCase();
  }

  private getMockMedicationPlans(): MedicationPlan[] {
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
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
        patientId: this.patientId || '550e8400-e29b-41d4-a716-446655440000',
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
        planId: planId,
        scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.TAKEN,
        takenAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        planId: planId,
        scheduledAt: new Date(now.getTime()).toISOString(),
        status: IntakeStatus.SCHEDULED
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        planId: planId,
        scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.SCHEDULED
      }
    ];
  }
}
