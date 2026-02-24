import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../../../profile/services/patient.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Patient } from '../../../../../shared/models/patient.model';

export interface AppointmentCreateDialogData {
  patientId?: string;
  doctorName?: string;
}

@Component({
  selector: 'app-appointment-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_circle</mat-icon>
      New Appointment
    </h2>
    
    <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <!-- Patient Selection Dropdown -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Patient</mat-label>
            <mat-select formControlName="patientId" [disabled]="!!data?.patientId">
              <mat-option *ngIf="loadingPatients" disabled>
                <mat-spinner diameter="20"></mat-spinner> Loading patients...
              </mat-option>
              <mat-option *ngFor="let patient of patients" [value]="patient.id">
                {{ patient.firstName }} {{ patient.lastName }} ({{ patient.email }})
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="appointmentForm.get('patientId')?.hasError('required')">
              Patient is required
            </mat-error>
          </mat-form-field>

          <!-- Doctor Name (Read-only, auto-filled) -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Doctor</mat-label>
            <input matInput formControlName="doctorName" readonly>
            <mat-icon matPrefix>medical_services</mat-icon>
          </mat-form-field>

          <!-- Appointment Date -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Appointment Date & Time</mat-label>
            <input 
              matInput 
              type="datetime-local" 
              formControlName="appointmentDate"
              placeholder="Select date and time"
            >
            <mat-icon matPrefix>schedule</mat-icon>
            <mat-error *ngIf="appointmentForm.get('appointmentDate')?.hasError('required')">
              Date and time are required
            </mat-error>
          </mat-form-field>

          <!-- Reason -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Appointment</mat-label>
            <textarea 
              matInput 
              formControlName="reason" 
              rows="2"
              placeholder="Briefly describe the reason for your visit"
            ></textarea>
            <mat-icon matPrefix>assignment</mat-icon>
            <mat-error *ngIf="appointmentForm.get('reason')?.hasError('required')">
              Reason is required
            </mat-error>
          </mat-form-field>

          <!-- Notes -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Notes (Optional)</mat-label>
            <textarea 
              matInput 
              formControlName="notes" 
              rows="3"
              placeholder="Any additional information you'd like to share"
            ></textarea>
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          type="submit"
          [disabled]="appointmentForm.invalid || appointmentForm.pending || loadingPatients"
        >
          <mat-icon>save</mat-icon>
          Create Appointment
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      
      mat-icon {
        color: #1976d2;
      }
    }

    mat-dialog-content {
      padding-top: 16px;
      min-width: 500px;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      mat-icon[matPrefix] {
        color: #666;
        margin-right: 8px;
      }
    }

    textarea {
      resize: vertical;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
      
      button[mat-raised-button] {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class AppointmentCreateDialogComponent implements OnInit {
  appointmentForm!: FormGroup;
  patients: Patient[] = [];
  loadingPatients = true;
  patientLoadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentCreateDialogData,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.initForm();
  }

  loadPatients(): void {
    this.loadingPatients = true;
    this.patientService.getPatients(1, 100)
      .pipe(
        catchError(err => {
          this.patientLoadError = 'Failed to load patients';
          return of({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
        }),
        finalize(() => this.loadingPatients = false)
      )
      .subscribe(response => {
        this.patients = response.data;
      });
  }

  initForm(): void {
    // Get current user for doctor name
    const currentUser = this.authService.getCurrentUser();
    const doctorName = this.data?.doctorName || 
      (currentUser ? `Dr. ${currentUser.firstName} ${currentUser.lastName}` : '');

    // If patientId is provided (patient creating their own), use it
    // Otherwise (doctor creating), let them select from dropdown
    const patientId = this.data?.patientId || '';

    this.appointmentForm = this.fb.group({
      patientId: [{ value: patientId, disabled: !!this.data?.patientId }, Validators.required],
      doctorName: [{ value: doctorName, disabled: true }],
      appointmentDate: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      // Use getRawValue() to include disabled fields
      const formValue = this.appointmentForm.getRawValue();
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
