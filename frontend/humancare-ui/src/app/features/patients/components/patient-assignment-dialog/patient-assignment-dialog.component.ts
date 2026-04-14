import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PatientService } from '../../../profile/services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Caregiver, Doctor, Patient } from '../../../../shared/models/patient.model';

export interface PatientAssignmentDialogData {
  patient: Patient;
  doctors: Doctor[];
  caregivers: Caregiver[];
}

export interface PatientAssignmentDialogResult {
  success: boolean;
}

@Component({
  selector: 'app-patient-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './patient-assignment-dialog.component.html',
  styleUrls: ['./patient-assignment-dialog.component.scss']
})
export class PatientAssignmentDialogComponent {
  saving = false;
  readonly assignmentForm;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private dialogRef: MatDialogRef<PatientAssignmentDialogComponent, PatientAssignmentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: PatientAssignmentDialogData
  ) {
    this.assignmentForm = this.fb.group({
      caregiverId: [this.data.patient.caregiverId ?? null],
      doctorId: [this.data.patient.doctorId ?? null]
    });
  }

  get patientName(): string {
    return `${this.data.patient.firstName} ${this.data.patient.lastName}`;
  }

  get hasChanges(): boolean {
    return this.selectedDoctorId !== (this.data.patient.doctorId ?? null) ||
      this.selectedCaregiverId !== (this.data.patient.caregiverId ?? null);
  }

  get selectedDoctorId(): string | null {
    return this.assignmentForm.value.doctorId ?? null;
  }

  get selectedCaregiverId(): string | null {
    return this.assignmentForm.value.caregiverId ?? null;
  }

  save(): void {
    if (!this.hasChanges) {
      return;
    }

    const requests = [];

    if (this.selectedDoctorId !== (this.data.patient.doctorId ?? null)) {
      requests.push(
        this.selectedDoctorId
          ? this.patientService.assignDoctor(this.data.patient.id, this.selectedDoctorId)
          : this.patientService.unassignDoctor(this.data.patient.id)
      );
    }

    if (this.selectedCaregiverId !== (this.data.patient.caregiverId ?? null)) {
      requests.push(
        this.selectedCaregiverId
          ? this.patientService.assignCaregiver(this.data.patient.id, this.selectedCaregiverId)
          : this.patientService.unassignCaregiver(this.data.patient.id)
      );
    }

    if (requests.length === 0) {
      this.dialogRef.close({ success: false });
      return;
    }

    this.saving = true;

    forkJoin(requests)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess(`Assignments updated for ${this.patientName}`);
          this.dialogRef.close({ success: true });
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
