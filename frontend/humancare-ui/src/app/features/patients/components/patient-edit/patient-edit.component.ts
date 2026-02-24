import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Patient, PatientUpdateRequest, PatientCreateRequest } from '../../../../shared/models/patient.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.scss']
})
export class PatientEditComponent implements OnInit {
  patientForm: FormGroup;
  patient: Patient | null = null;
  patientId: string | null = null;
  isNewPatient = false;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    this.isNewPatient = this.patientId === 'new' || !this.patientId;

    if (this.isNewPatient) {
      this.loading = false;
    } else {
      this.loadPatient();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [null],
      address: [''],
      emergencyContact: [''],
      medicalHistory: ['']
    });
  }

  loadPatient(): void {
    this.loading = true;
    this.error = null;

    if (!this.patientId) {
      this.error = 'Patient ID not provided';
      this.loading = false;
      return;
    }

    this.patientService.getPatientById(this.patientId)
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
          this.patientForm.patchValue({
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
            address: patient.address,
            emergencyContact: patient.emergencyContact,
            medicalHistory: patient.medicalHistory
          });
        }
      });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      return;
    }

    this.saving = true;

    const formData = {
      firstName: this.patientForm.value.firstName,
      lastName: this.patientForm.value.lastName,
      email: this.patientForm.value.email,
      phone: this.patientForm.value.phone || undefined,
      dateOfBirth: this.patientForm.value.dateOfBirth ? this.formatDate(this.patientForm.value.dateOfBirth) : undefined,
      address: this.patientForm.value.address || undefined,
      emergencyContact: this.patientForm.value.emergencyContact || undefined,
      medicalHistory: this.patientForm.value.medicalHistory || undefined
    };

    if (this.isNewPatient) {
      this.createPatient(formData as PatientCreateRequest);
    } else if (this.patientId) {
      this.updatePatient(this.patientId, formData as PatientUpdateRequest);
    }
  }

  createPatient(data: PatientCreateRequest): void {
    this.patientService.createPatient(data)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Patient created successfully');
          this.router.navigate(['/patients']);
        }
      });
  }

  updatePatient(id: string, data: PatientUpdateRequest): void {
    this.patientService.updatePatient(id, data)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Patient updated successfully');
          this.router.navigate(['/patients', id]);
        }
      });
  }

  onCancel(): void {
    if (this.patientForm.dirty && !this.isNewPatient) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Discard Changes?',
          message: 'You have unsaved changes. Are you sure you want to discard them?',
          confirmButtonText: 'Discard',
          cancelButtonText: 'Keep Editing',
          confirmButtonColor: 'warn',
          icon: 'warning'
        } as ConfirmDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.goBack();
        }
      });
    } else {
      this.goBack();
    }
  }

  goBack(): void {
    if (this.isNewPatient) {
      this.router.navigate(['/patients']);
    } else if (this.patientId) {
      this.router.navigate(['/patients', this.patientId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
