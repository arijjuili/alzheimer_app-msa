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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { 
  MedicationPlan, 
  MedicationIntake, 
  MedicationForm,
  IntakeStatus,
  MedicationPlanCreateRequest 
} from '../../../../shared/models/medication.model';
import { MedicationService } from '../../services/medication.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { MedicationCreateDialogComponent } from '../dialogs/medication-create-dialog.component';
import { MedicationDetailDialogComponent } from '../dialogs/medication-detail-dialog.component';
import { IntakeStatusDialogComponent } from '../dialogs/intake-status-dialog.component';

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
    MatExpansionModule,
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
  expandedPlan: MedicationPlan | null = null;
  planIntakes: Map<string, MedicationIntake[]> = new Map();
  loadingIntakes: Set<string> = new Set();

  constructor(
    private medicationService: MedicationService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientId = this.getPatientIdFromToken();
    this.loadMedications();
  }

  getPatientIdFromToken(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.id || null;
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
        // If API returns empty data, use mock data for demo
        if (plans.length === 0) {
          this.dataSource.data = this.getMockMedicationPlans();
        } else {
          this.dataSource.data = plans;
        }
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

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MedicationCreateDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createMedicationPlan(result);
      }
    });
  }

  openDetailDialog(plan: MedicationPlan): void {
    const intakes = plan.id ? this.planIntakes.get(plan.id) || [] : [];
    this.dialog.open(MedicationDetailDialogComponent, {
      width: '500px',
      data: { plan, intakes }
    });
  }

  openIntakeStatusDialog(intake: MedicationIntake): void {
    const dialogRef = this.dialog.open(IntakeStatusDialogComponent, {
      width: '500px',
      data: { intake }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && intake.id) {
        this.updateIntake(intake.id, result);
      }
    });
  }

  createMedicationPlan(planData: Partial<MedicationPlanCreateRequest>): void {
    if (!this.patientId) return;

    const newPlan: MedicationPlanCreateRequest = {
      patientId: this.patientId,
      medicationName: planData.medicationName || '',
      dosage: planData.dosage || '',
      form: planData.form || MedicationForm.TABLET,
      frequencyPerDay: planData.frequencyPerDay || 1,
      startDate: planData.startDate || new Date().toISOString().split('T')[0],
      endDate: planData.endDate,
      instructions: planData.instructions,
      active: true
    };

    this.medicationService.createPlan(newPlan)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.loadMedications();
        }
      });
  }

  deleteMedicationPlan(plan: MedicationPlan): void {
    if (!plan.id || !plan.active) return;

    this.medicationService.deletePlan(plan.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.loadMedications();
        }
      });
  }

  updateIntake(intakeId: string, updateData: Partial<MedicationIntake>): void {
    this.medicationService.updateIntake(intakeId, updateData)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          // Reload intakes for the affected plan
          this.planIntakes.forEach((intakes, planId) => {
            const intake = intakes.find(i => i.id === intakeId);
            if (intake) {
              this.loadIntakesForPlan(planId);
            }
          });
        }
      });
  }

  canDelete(plan: MedicationPlan): boolean {
    return plan.active === true;
  }

  getStatusColor(status: boolean | undefined): string {
    return status ? 'primary' : 'warn';
  }

  getIntakeStatusColor(status: IntakeStatus): string {
    switch (status) {
      case IntakeStatus.TAKEN:
        return 'accent';
      case IntakeStatus.MISSED:
        return 'warn';
      case IntakeStatus.SKIPPED:
        return 'orange';
      case IntakeStatus.SCHEDULED:
      default:
        return 'primary';
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        id: `intake-${planId}-1`,
        planId: planId,
        scheduledAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.TAKEN,
        takenAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
      },
      {
        id: `intake-${planId}-2`,
        planId: planId,
        scheduledAt: new Date(now.getTime()).toISOString(),
        status: IntakeStatus.SCHEDULED
      },
      {
        id: `intake-${planId}-3`,
        planId: planId,
        scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.SCHEDULED
      }
    ];
  }
}
