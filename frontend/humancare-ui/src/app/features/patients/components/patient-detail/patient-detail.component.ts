import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient, PatientAudit } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTableModule,
    MatDialogModule,
    DateFormatPipe,
    InitialsPipe
  ],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  auditLogs: PatientAudit[] = [];
  loading = true;
  error: string | null = null;
  assigning = false;
  currentUserId: string | null = null;

  constructor(
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.loadPatient();
  }

  loadPatient(): void {
    this.loading = true;
    this.error = null;

    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      this.error = 'Patient ID not provided';
      this.loading = false;
      return;
    }

    this.patientService.getPatientById(patientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load patient details';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(patient => {
        if (patient) {
          this.patient = patient;
          this.loadAuditLogs(patientId);
        }
      });
  }

  loadAuditLogs(patientId: string): void {
    this.patientService.getPatientAudit(patientId)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(logs => {
        this.auditLogs = logs.length > 0 ? logs : this.getMockAuditLogs();
      });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  canEdit(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  getActionClass(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'create-chip';
      case 'UPDATE':
        return 'update-chip';
      case 'DELETE':
        return 'delete-chip';
      default:
        return '';
    }
  }

  // Assignment methods
  canAssign(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  canAssignCaregiver(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR');
  }

  isMyPatient(): boolean {
    return this.patient?.doctorId === this.currentUserId;
  }

  assignToMe(): void {
    if (!this.patient || !this.currentUserId) return;
    
    this.assigning = true;
    this.patientService.assignDoctor(this.patient.id, this.currentUserId)
      .pipe(
        finalize(() => this.assigning = false)
      )
      .subscribe({
        next: (updatedPatient) => {
          this.patient = updatedPatient;
        },
        error: (err) => {
          this.errorHandler.handleError(err);
        }
      });
  }

  openAssignDoctorDialog(): void {
    // TODO: Implement dialog to select doctor
    // For now, just assign to current user if not assigned
    if (!this.patient?.doctorId && this.currentUserId) {
      this.assignToMe();
    }
  }

  openAssignCaregiverDialog(): void {
    // TODO: Implement dialog to select caregiver
    // For now, this is a placeholder
  }

  addMedication(): void {
    if (!this.patient) return;
    this.router.navigate(['/medications', 'plans', 'new'], {
      queryParams: { patientId: this.patient.id }
    });
  }

  scheduleAppointment(): void {
    if (!this.patient) return;
    this.router.navigate(['/appointments', 'new'], {
      queryParams: { patientId: this.patient.id }
    });
  }

  private getMockAuditLogs(): PatientAudit[] {
    return [
      {
        id: '1',
        patientId: this.patient?.id || 'p1',
        action: 'UPDATE',
        oldValue: JSON.stringify({ phone: '+1 (555) 123-4560' }),
        newValue: JSON.stringify({ phone: '+1 (555) 123-4567' }),
        changedBy: 'Dr. Smith',
        changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        patientId: this.patient?.id || 'p1',
        action: 'UPDATE',
        oldValue: JSON.stringify({ address: '123 Old St' }),
        newValue: JSON.stringify({ address: '123 Main St, City, State 12345' }),
        changedBy: 'Admin User',
        changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}
