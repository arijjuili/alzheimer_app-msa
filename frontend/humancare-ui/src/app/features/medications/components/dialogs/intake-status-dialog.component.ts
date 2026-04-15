import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

import { MedicationIntake, IntakeStatus } from '../../../../shared/models/medication.model';

interface IntakeStatusDialogData {
  intake: MedicationIntake;
  professional?: boolean;
}

@Component({
  selector: 'app-intake-status-dialog',
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
    MatDividerModule
  ],
  template: `
    <div [class.professional-mode]="data.professional">
      <h2 mat-dialog-title>
        <mat-icon>edit_note</mat-icon>
        Update Intake Status
      </h2>

      <form [formGroup]="intakeForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-container">
            <!-- Scheduled Time Info -->
            <div class="info-row">
              <mat-icon>schedule</mat-icon>
              <span>Scheduled: {{ formatDateTime(data.intake.scheduledAt) }}</span>
            </div>

            <mat-divider></mat-divider>

            <!-- Status Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let status of intakeStatuses" [value]="status.value">
                  <div class="status-option">
                    <span class="status-dot" [ngClass]="'status-' + status.value.toLowerCase()"></span>
                    {{ status.label }}
                  </div>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>flag</mat-icon>
              <mat-error *ngIf="intakeForm.get('status')?.hasError('required')">
                Status is required
              </mat-error>
            </mat-form-field>

            <!-- Taken At (for TAKEN status) -->
            <mat-form-field
              appearance="outline"
              class="full-width"
              *ngIf="intakeForm.get('status')?.value === 'TAKEN'"
            >
              <mat-label>Taken At</mat-label>
              <input
                matInput
                type="datetime-local"
                formControlName="takenAt"
              >
              <mat-icon matPrefix>event_available</mat-icon>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (Optional)</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="3"
                placeholder="Add any notes about this intake"
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
            [color]="getSubmitButtonColor()"
            type="submit"
            [disabled]="intakeForm.invalid || intakeForm.pending"
          >
            <mat-icon>save</mat-icon>
            Update Status
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
        font-size: 26px;
        animation: bounce 2s infinite;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    mat-dialog-content {
      padding-top: 16px;
      min-width: 400px;
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

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: rgba(255, 243, 224, 0.8);
      border-radius: 12px;
      color: #bf360c;
      font-weight: 500;

      mat-icon {
        color: #ff8f00;
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

    .status-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;

      &.status-taken {
        background-color: #69f0ae;
      }

      &.status-missed {
        background-color: #f44336;
      }

      &.status-skipped {
        background-color: #ff9800;
      }

      &.status-scheduled {
        background-color: #1976d2;
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
      }
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
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
    .professional-mode .info-row {
      background-color: #f5f5f5;
      border-radius: 4px;
      color: #333;
    }
    .professional-mode .info-row mat-icon {
      color: #666;
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
      font-weight: 500;
    }
  `]
})
export class IntakeStatusDialogComponent implements OnInit {
  intakeForm!: FormGroup;
  intakeStatuses = [
    { value: IntakeStatus.TAKEN, label: 'Taken' },
    { value: IntakeStatus.MISSED, label: 'Missed' },
    { value: IntakeStatus.SKIPPED, label: 'Skipped' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IntakeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IntakeStatusDialogData
  ) {}

  ngOnInit(): void {
    this.intakeForm = this.fb.group({
      status: [IntakeStatus.TAKEN, [Validators.required]],
      takenAt: [new Date().toISOString().slice(0, 16)],
      notes: ['']
    });

    this.intakeForm.get('status')?.valueChanges.subscribe(status => {
      if (status === IntakeStatus.TAKEN) {
        this.intakeForm.get('takenAt')?.setValue(new Date().toISOString().slice(0, 16));
      } else {
        this.intakeForm.get('takenAt')?.setValue(null);
      }
    });
  }

  onSubmit(): void {
    if (this.intakeForm.valid) {
      const formValue = this.intakeForm.value;
      const result: Partial<MedicationIntake> = {
        status: formValue.status,
        notes: formValue.notes || undefined
      };

      if (formValue.status === IntakeStatus.TAKEN && formValue.takenAt) {
        result.takenAt = new Date(formValue.takenAt).toISOString();
      }

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getSubmitButtonColor(): string {
    const status = this.intakeForm.get('status')?.value;
    switch (status) {
      case IntakeStatus.TAKEN:
        return 'accent';
      case IntakeStatus.MISSED:
        return 'warn';
      case IntakeStatus.SKIPPED:
        return 'primary';
      default:
        return 'primary';
    }
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
