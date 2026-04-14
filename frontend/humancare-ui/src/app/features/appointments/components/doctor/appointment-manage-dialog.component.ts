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
            <span class="detail-label">Patient</span>
            <span class="detail-value">{{ $any(data.appointment).patientName || data.appointment.patientId }}</span>
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
      background: #ffffff;
      border-radius: 4px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 24px 0;
      border-bottom: 1px solid #eceff1;
      margin: 0 0 12px 0;
      padding-bottom: 12px;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #263238;
      }
    }

    .header-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #455a64;
    }

    .dialog-content {
      padding: 12px 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .view-mode {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.full-width {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
    }

    .detail-label {
      color: #607d8b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-weight: 500;
    }

    .detail-value {
      font-weight: 500;
      color: #263238;
      font-size: 15px;

      &.patient-id {
        font-family: monospace;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 13px;
      }

      &.notes {
        font-weight: 400;
        white-space: pre-wrap;
        line-height: 1.5;
        color: #455a64;
      }
    }

    .detail-divider {
      display: none;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-row {
      display: flex;
      gap: 14px;

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
      padding-top: 16px;
      border-top: 1px solid #eceff1;
    }

    .action-divider {
      display: none;
    }

    .action-title {
      margin: 0 0 10px;
      color: #546e7a;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        border-radius: 3px;
        font-weight: 500;
      }
    }

    .dialog-actions {
      padding: 12px 24px;
      gap: 8px;
      border-top: 1px solid #eceff1;
      background: #fafafa;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        border-radius: 3px;
        font-weight: 500;
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
