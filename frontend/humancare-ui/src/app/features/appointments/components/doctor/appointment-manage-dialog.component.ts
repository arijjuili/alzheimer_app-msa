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
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Appointment, AppointmentStatus, AppointmentUpdateRequest } from '../../../../shared/models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface AppointmentManageDialogData {
  appointment: Appointment;
  mode: 'view' | 'edit';
}

@Component({
  selector: 'app-appointment-manage-dialog',
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
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="header-icon">event_note</mat-icon>
        <h2 mat-dialog-title>{{ isEditMode ? 'Edit Appointment' : 'Appointment Details' }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <!-- View Mode -->
        <div *ngIf="!isEditMode" class="view-mode">
          <div class="detail-row">
            <span class="detail-label">Patient ID</span>
            <span class="detail-value patient-id">#{{ data.appointment.patientId }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">{{ data.appointment.doctorName }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">{{ formatDateTime(data.appointment.appointmentDate) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">{{ data.appointment.reason }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <mat-chip [color]="getStatusColor(data.appointment.status)" selected>
              {{ data.appointment.status }}
            </mat-chip>
          </div>
          
          <mat-divider class="detail-divider"></mat-divider>
          
          <div class="detail-row full-width">
            <span class="detail-label">Notes</span>
            <span class="detail-value notes">{{ data.appointment.notes || 'No notes added' }}</span>
          </div>
        </div>

        <!-- Edit Mode -->
        <form *ngIf="isEditMode" [formGroup]="appointmentForm" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Patient ID</mat-label>
              <input matInput [value]="data.appointment.patientId" disabled>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Doctor Name</mat-label>
              <input matInput formControlName="doctorName" placeholder="Enter doctor name">
              <mat-error *ngIf="appointmentForm.get('doctorName')?.hasError('required')">
                Doctor name is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Appointment Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="appointmentDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="appointmentForm.get('appointmentDate')?.hasError('required')">
                Date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput type="time" formControlName="appointmentTime">
              <mat-error *ngIf="appointmentForm.get('appointmentTime')?.hasError('required')">
                Time is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason</mat-label>
              <input matInput formControlName="reason" placeholder="Enter appointment reason">
              <mat-error *ngIf="appointmentForm.get('reason')?.hasError('required')">
                Reason is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option [value]="AppointmentStatus.SCHEDULED">Scheduled</mat-option>
                <mat-option [value]="AppointmentStatus.COMPLETED">Completed</mat-option>
                <mat-option [value]="AppointmentStatus.CANCELLED">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="3" placeholder="Add any notes..."></textarea>
            </mat-form-field>
          </div>
        </form>

        <!-- Status Action Buttons (Visible in both modes) -->
        <div class="status-actions" *ngIf="data.appointment.status === AppointmentStatus.SCHEDULED">
          <mat-divider class="action-divider"></mat-divider>
          <p class="action-title">Quick Actions</p>
          <div class="action-buttons">
            <button mat-raised-button color="accent" (click)="markComplete()" [disabled]="saving">
              <mat-icon>check_circle</mat-icon>
              Mark Complete
            </button>
            <button mat-raised-button color="warn" (click)="cancelAppointment()" [disabled]="saving">
              <mat-icon>cancel</mat-icon>
              Cancel Appointment
            </button>
          </div>
        </div>
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
          [disabled]="appointmentForm.invalid || saving"
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
      max-width: 600px;
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

      &.patient-id {
        font-family: monospace;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
      }

      &.notes {
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

    .status-actions {
      margin-top: 16px;
    }

    .action-divider {
      margin-bottom: 16px;
    }

    .action-title {
      margin: 0 0 12px;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
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

      .action-buttons {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class AppointmentManageDialogComponent {
  isEditMode: boolean;
  appointmentForm: FormGroup;
  saving = false;

  // Expose enum to template
  AppointmentStatus = AppointmentStatus;

  constructor(
    public dialogRef: MatDialogRef<AppointmentManageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentManageDialogData,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private errorHandler: ErrorHandlerService
  ) {
    this.isEditMode = data.mode === 'edit';
    
    const date = new Date(data.appointment.appointmentDate);
    
    this.appointmentForm = this.fb.group({
      doctorName: [data.appointment.doctorName, Validators.required],
      appointmentDate: [date, Validators.required],
      appointmentTime: [this.formatTime(date), Validators.required],
      reason: [data.appointment.reason, Validators.required],
      status: [data.appointment.status, Validators.required],
      notes: [data.appointment.notes || '']
    });
  }

  switchToEditMode(): void {
    this.isEditMode = true;
  }

  onSave(): void {
    if (this.appointmentForm.invalid) {
      return;
    }

    this.saving = true;
    const formValue = this.appointmentForm.value;
    
    // Combine date and time
    const date = new Date(formValue.appointmentDate);
    const [hours, minutes] = formValue.appointmentTime.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const updateRequest: AppointmentUpdateRequest = {
      doctorName: formValue.doctorName,
      appointmentDate: date.toISOString(),
      reason: formValue.reason,
      status: formValue.status,
      notes: formValue.notes
    };

    this.appointmentService.updateAppointment(this.data.appointment.id, updateRequest)
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

  markComplete(): void {
    this.updateStatus(AppointmentStatus.COMPLETED);
  }

  cancelAppointment(): void {
    this.updateStatus(AppointmentStatus.CANCELLED);
  }

  private updateStatus(status: AppointmentStatus): void {
    this.saving = true;
    
    const updateRequest: AppointmentUpdateRequest = {
      status
    };

    this.appointmentService.updateAppointment(this.data.appointment.id, updateRequest)
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'primary';
      case AppointmentStatus.COMPLETED:
        return 'accent';
      case AppointmentStatus.CANCELLED:
        return 'warn';
      default:
        return 'default';
    }
  }
}
