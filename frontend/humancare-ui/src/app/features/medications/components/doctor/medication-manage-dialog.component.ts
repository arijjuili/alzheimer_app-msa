import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MedicationPlan, MedicationForm, MedicationPlanUpdateRequest } from '../../../../shared/models/medication.model';
import { MedicationService } from '../../services/medication.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface MedicationManageDialogData {
  medication: MedicationPlan;
  mode: 'view' | 'edit';
}

@Component({
  selector: 'app-medication-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="header-icon">medication</mat-icon>
        <h2 mat-dialog-title>{{ isEditMode ? 'Edit Medication Plan' : 'Medication Details' }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <!-- View Mode -->
        <div *ngIf="!isEditMode" class="view-mode">
          <div class="detail-row">
            <span class="detail-label">Medication Name</span>
            <span class="detail-value medication-name">{{ data.medication.medicationName }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Patient ID</span>
            <span class="detail-value patient-id">#{{ data.medication.patientId }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Dosage</span>
            <span class="detail-value">{{ data.medication.dosage }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Form</span>
            <span class="detail-value">{{ getFormLabel(data.medication.form) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Frequency</span>
            <span class="detail-value">{{ data.medication.frequencyPerDay }} times per day</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Start Date</span>
            <span class="detail-value">{{ formatDate(data.medication.startDate) }}</span>
          </div>
          
          <div class="detail-row" *ngIf="data.medication.endDate">
            <span class="detail-label">End Date</span>
            <span class="detail-value">{{ formatDate(data.medication.endDate) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <mat-chip [color]="data.medication.active !== false ? 'primary' : 'warn'" selected>
              {{ data.medication.active !== false ? 'Active' : 'Inactive' }}
            </mat-chip>
          </div>
          
          <mat-divider class="detail-divider"></mat-divider>
          
          <div class="detail-row full-width">
            <span class="detail-label">Instructions</span>
            <span class="detail-value instructions">{{ data.medication.instructions || 'No instructions provided' }}</span>
          </div>
        </div>

        <!-- Edit Mode -->
        <form *ngIf="isEditMode" [formGroup]="medicationForm" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Medication Name</mat-label>
              <input matInput [value]="data.medication.medicationName" disabled>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Patient ID</mat-label>
              <input matInput [value]="data.medication.patientId" disabled>
            </mat-form-field>
          </div>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Dosage</mat-label>
              <input matInput formControlName="dosage" placeholder="e.g., 500mg">
              <mat-error *ngIf="medicationForm.get('dosage')?.hasError('required')">
                Dosage is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Form</mat-label>
              <mat-select formControlName="form">
                <mat-option [value]="MedicationForm.TABLET">Tablet</mat-option>
                <mat-option [value]="MedicationForm.SYRUP">Syrup</mat-option>
                <mat-option [value]="MedicationForm.INJECTION">Injection</mat-option>
                <mat-option [value]="MedicationForm.DROPS">Drops</mat-option>
                <mat-option [value]="MedicationForm.OTHER">Other</mat-option>
              </mat-select>
              <mat-error *ngIf="medicationForm.get('form')?.hasError('required')">
                Form is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Frequency (times per day)</mat-label>
              <input matInput type="number" formControlName="frequencyPerDay" min="1" max="24">
              <mat-error *ngIf="medicationForm.get('frequencyPerDay')?.hasError('required')">
                Frequency is required
              </mat-error>
              <mat-error *ngIf="medicationForm.get('frequencyPerDay')?.hasError('min')">
                Minimum is 1
              </mat-error>
            </mat-form-field>

            <div class="toggle-field">
              <mat-slide-toggle formControlName="active" color="primary">
                {{ medicationForm.get('active')?.value ? 'Active' : 'Inactive' }}
              </mat-slide-toggle>
            </div>
          </div>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="medicationForm.get('startDate')?.hasError('required')">
                Start date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date (Optional)</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Instructions</mat-label>
              <textarea matInput formControlName="instructions" rows="3" placeholder="Add instructions for the patient..."></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()" [disabled]="saving">
          {{ isEditMode ? 'Cancel' : 'Close' }}
        </button>
        <button 
          *ngIf="!isEditMode"
          mat-raised-button 
          color="primary"
          (click)="switchToEditMode()"
        >
          <mat-icon>edit</mat-icon>
          Edit
        </button>
        <button 
          *ngIf="isEditMode"
          mat-raised-button 
          color="primary"
          (click)="onSave()"
          [disabled]="medicationForm.invalid || saving"
        >
          <mat-icon>save</mat-icon>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 700px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 0;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1976d2;
    }

    .dialog-content {
      padding: 16px 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .view-mode {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.full-width {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .detail-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .detail-value {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);

      &.medication-name {
        font-size: 16px;
        color: #1976d2;
      }

      &.patient-id {
        font-family: monospace;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
      }

      &.instructions {
        font-weight: 400;
        white-space: pre-wrap;
        line-height: 1.5;
      }
    }

    .detail-divider {
      margin: 8px 0;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;

      &.two-columns {
        display: grid;
        grid-template-columns: 2fr 1fr;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
    }

    .toggle-field {
      display: flex;
      align-items: center;
      padding: 12px 0;
    }

    .dialog-actions {
      padding: 16px 24px;
      gap: 8px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: auto;
        max-width: 100%;
      }

      .form-row.two-columns {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MedicationManageDialogComponent {
  isEditMode: boolean;
  medicationForm: FormGroup;
  saving = false;

  // Expose enum to template
  MedicationForm = MedicationForm;

  constructor(
    public dialogRef: MatDialogRef<MedicationManageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicationManageDialogData,
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private errorHandler: ErrorHandlerService
  ) {
    this.isEditMode = data.mode === 'edit';
    
    const startDate = data.medication.startDate ? new Date(data.medication.startDate) : null;
    const endDate = data.medication.endDate ? new Date(data.medication.endDate) : null;
    
    this.medicationForm = this.fb.group({
      dosage: [data.medication.dosage, Validators.required],
      form: [data.medication.form, Validators.required],
      frequencyPerDay: [data.medication.frequencyPerDay, [Validators.required, Validators.min(1)]],
      startDate: [startDate, Validators.required],
      endDate: [endDate],
      instructions: [data.medication.instructions || ''],
      active: [data.medication.active !== false]
    });
  }

  switchToEditMode(): void {
    this.isEditMode = true;
  }

  onSave(): void {
    if (this.medicationForm.invalid) {
      return;
    }

    this.saving = true;
    const formValue = this.medicationForm.value;
    
    const updateRequest: MedicationPlanUpdateRequest = {
      dosage: formValue.dosage,
      form: formValue.form,
      frequencyPerDay: formValue.frequencyPerDay,
      startDate: formValue.startDate ? this.formatDateForApi(formValue.startDate) : undefined,
      endDate: formValue.endDate ? this.formatDateForApi(formValue.endDate) : undefined,
      instructions: formValue.instructions,
      active: formValue.active
    };

    this.medicationService.updatePlan(this.data.medication.id!, updateRequest)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(result => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  getFormLabel(form: MedicationForm): string {
    switch (form) {
      case MedicationForm.TABLET:
        return 'Tablet';
      case MedicationForm.SYRUP:
        return 'Syrup';
      case MedicationForm.INJECTION:
        return 'Injection';
      case MedicationForm.DROPS:
        return 'Drops';
      case MedicationForm.OTHER:
        return 'Other';
      default:
        return form;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
