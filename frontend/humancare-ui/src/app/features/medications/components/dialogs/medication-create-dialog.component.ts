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

import { MedicationForm } from '../../../../shared/models/medication.model';
import { Patient } from '../../../../shared/models/patient.model';

export interface MedicationCreateDialogData {
  patientId?: string;
  patients?: Patient[];
  professional?: boolean;
}

@Component({
  selector: 'app-medication-create-dialog',
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
    <div [class.professional-mode]="data.professional">
      <h2 mat-dialog-title>
        <mat-icon>add_circle</mat-icon>
        New Medication Plan
      </h2>

      <form [formGroup]="medicationForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-container">
            <!-- Patient Selection Dropdown -->
            <mat-form-field appearance="outline" class="full-width" *ngIf="data.patients && data.patients.length > 0">
              <mat-label>Patient</mat-label>
              <mat-select formControlName="patientId">
                <mat-option *ngFor="let patient of data.patients" [value]="patient.id">
                  {{ patient.firstName }} {{ patient.lastName }}
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="medicationForm.get('patientId')?.hasError('required')">
                Patient is required
              </mat-error>
            </mat-form-field>

            <!-- Patient ID (fallback when no patients list) -->
            <mat-form-field appearance="outline" class="full-width" *ngIf="!data.patients || data.patients.length === 0">
              <mat-label>Patient ID</mat-label>
              <input matInput type="text" formControlName="patientId" placeholder="Enter patient ID" [readonly]="!!data.patientId">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="medicationForm.get('patientId')?.hasError('required')">
                Patient ID is required
              </mat-error>
            </mat-form-field>

            <!-- Medication Name -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Medication Name</mat-label>
              <input matInput formControlName="medicationName" placeholder="Enter medication name">
              <mat-icon matPrefix>medication</mat-icon>
              <mat-error *ngIf="medicationForm.get('medicationName')?.hasError('required')">
                Medication name is required
              </mat-error>
            </mat-form-field>

            <!-- Dosage -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dosage</mat-label>
              <input matInput formControlName="dosage" placeholder="e.g., 500mg, 1 tablet">
              <mat-icon matPrefix>straighten</mat-icon>
              <mat-error *ngIf="medicationForm.get('dosage')?.hasError('required')">
                Dosage is required
              </mat-error>
            </mat-form-field>

            <!-- Form and Frequency Row -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Form</mat-label>
                <mat-select formControlName="form">
                  <mat-option *ngFor="let form of medicationForms" [value]="form.value">
                    {{ form.label }}
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
                <mat-error *ngIf="medicationForm.get('form')?.hasError('required')">
                  Form is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Times per Day</mat-label>
                <input matInput type="number" formControlName="frequencyPerDay" min="1" max="24">
                <mat-icon matPrefix>repeat</mat-icon>
                <mat-error *ngIf="medicationForm.get('frequencyPerDay')?.hasError('required')">
                  Frequency is required
                </mat-error>
                <mat-error *ngIf="medicationForm.get('frequencyPerDay')?.hasError('min')">
                  Must be at least 1
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Start Date -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matPrefix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="medicationForm.get('startDate')?.hasError('required')">
                Start date is required
              </mat-error>
            </mat-form-field>

            <!-- End Date (Optional) -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>End Date (Optional)</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate">
              <mat-datepicker-toggle matPrefix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <!-- Instructions -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Instructions (Optional)</mat-label>
              <textarea
                matInput
                formControlName="instructions"
                rows="3"
                placeholder="e.g., Take with food, avoid alcohol"
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
            [disabled]="medicationForm.invalid || medicationForm.pending"
          >
            <mat-icon>save</mat-icon>
            Create Plan
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #e65100;

      mat-icon {
        color: #ff6f00;
        font-size: 28px;
        animation: bounce 2s infinite;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    mat-dialog-content {
      padding-top: 16px;
      min-width: 500px;
      background: linear-gradient(180deg, #fff8e1 0%, #ffffff 100%);
      border-radius: 20px;
      margin: 8px 16px;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;

      .form-field {
        flex: 1;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      background: rgba(255,255,255,0.9);
      border-radius: 14px;
      padding: 4px 8px;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);

      mat-icon[matPrefix] {
        color: #ff8f00;
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
        border-radius: 50px;
        padding: 8px 24px;
        font-weight: 700;
        background: linear-gradient(90deg, #ff7043, #ffca28);
        color: white;
      }
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }

    /* Professional mode overrides */
    .professional-mode h2[mat-dialog-title] {
      color: #263238;
      font-size: 18px;
      font-weight: 500;
    }
    .professional-mode h2[mat-dialog-title] mat-icon {
      color: #455a64;
      animation: none;
    }
    .professional-mode mat-dialog-content {
      background: #ffffff;
      border-radius: 0;
      margin: 0;
    }
    .professional-mode .form-container {
      padding: 0;
    }
    .professional-mode mat-form-field {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
    }
    .professional-mode mat-form-field mat-icon[matPrefix] {
      color: #607d8b;
    }
    .professional-mode mat-dialog-actions button[mat-raised-button] {
      border-radius: 4px;
      background: #1976d2;
      font-weight: 500;
    }
  `]
})
export class MedicationCreateDialogComponent implements OnInit {
  medicationForm!: FormGroup;
  medicationForms = [
    { value: MedicationForm.TABLET, label: 'Tablet' },
    { value: MedicationForm.SYRUP, label: 'Syrup' },
    { value: MedicationForm.INJECTION, label: 'Injection' },
    { value: MedicationForm.DROPS, label: 'Drops' },
    { value: MedicationForm.OTHER, label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MedicationCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicationCreateDialogData
  ) {}

  ngOnInit(): void {
    const patientId = this.data?.patientId || '';
    this.medicationForm = this.fb.group({
      patientId: [patientId, Validators.required],
      medicationName: ['', Validators.required],
      dosage: ['', Validators.required],
      form: [MedicationForm.TABLET, Validators.required],
      frequencyPerDay: [1, [Validators.required, Validators.min(1)]],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      instructions: ['']
    });
  }

  onSubmit(): void {
    if (this.medicationForm.valid) {
      const formValue = this.medicationForm.value;
      const result = {
        ...formValue,
        startDate: formValue.startDate ? formValue.startDate.toISOString().split('T')[0] : null,
        endDate: formValue.endDate ? formValue.endDate.toISOString().split('T')[0] : undefined
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
