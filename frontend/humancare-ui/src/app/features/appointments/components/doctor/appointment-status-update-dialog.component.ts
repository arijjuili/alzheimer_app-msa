import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Appointment, AppointmentStatus, AppointmentUpdateRequest } from '../../../../shared/models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface AppointmentStatusUpdateDialogData {
  appointment: Appointment;
}

@Component({
  selector: 'app-appointment-status-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="header-icon" [color]="getStatusColor(data.appointment.status)">
          {{ getStatusIcon(data.appointment.status) }}
        </mat-icon>
        <h2 mat-dialog-title>Update Appointment Status</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <!-- Current Status -->
        <div class="current-status">
          <p class="section-label">Current Status</p>
          <mat-chip [color]="getStatusColor(data.appointment.status)" selected class="status-chip">
            {{ data.appointment.status }}
          </mat-chip>
        </div>

        <!-- Appointment Info -->
        <div class="appointment-info">
          <div class="info-row">
            <mat-icon>person</mat-icon>
            <span>Patient ID: <strong>#{{ data.appointment.patientId }}</strong></span>
          </div>
          <div class="info-row">
            <mat-icon>event</mat-icon>
            <span>{{ formatDateTime(data.appointment.appointmentDate) }}</span>
          </div>
          <div class="info-row">
            <mat-icon>medical_services</mat-icon>
            <span>{{ data.appointment.doctorName }}</span>
          </div>
        </div>

        <mat-divider class="content-divider"></mat-divider>

        <!-- Status Options -->
        <div class="status-options" *ngIf="data.appointment.status === AppointmentStatus.SCHEDULED">
          <p class="section-label">Change Status To:</p>
          
          <div class="option-buttons">
            <button 
              mat-raised-button 
              color="accent"
              class="status-option completed"
              (click)="selectedStatus = AppointmentStatus.COMPLETED"
              [class.selected]="selectedStatus === AppointmentStatus.COMPLETED"
              [disabled]="updating"
            >
              <mat-icon>check_circle</mat-icon>
              <div class="option-content">
                <span class="option-label">Completed</span>
                <span class="option-hint">Mark as finished</span>
              </div>
            </button>

            <button 
              mat-raised-button 
              color="warn"
              class="status-option cancelled"
              (click)="selectedStatus = AppointmentStatus.CANCELLED"
              [class.selected]="selectedStatus === AppointmentStatus.CANCELLED"
              [disabled]="updating"
            >
              <mat-icon>cancel</mat-icon>
              <div class="option-content">
                <span class="option-label">Cancelled</span>
                <span class="option-hint">Cancel appointment</span>
              </div>
            </button>
          </div>
        </div>

        <!-- No Options Available -->
        <div class="no-options" *ngIf="data.appointment.status !== AppointmentStatus.SCHEDULED">
          <mat-icon class="info-icon">info</mat-icon>
          <p>This appointment is already <strong>{{ data.appointment.status | lowercase }}</strong>.</p>
          <p class="hint">Only scheduled appointments can have their status changed.</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()" [disabled]="updating">
          Cancel
        </button>
        <button 
          *ngIf="data.appointment.status === AppointmentStatus.SCHEDULED"
          mat-raised-button 
          color="primary"
          (click)="onConfirm()"
          [disabled]="!selectedStatus || updating"
        >
          <mat-icon *ngIf="!updating">save</mat-icon>
          <mat-icon *ngIf="updating" class="spin">refresh</mat-icon>
          {{ updating ? 'Updating...' : 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
      max-width: 450px;
      background: #ffffff;
      border-radius: 4px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 24px 0;
      border-bottom: 1px solid #eceff1;
      margin-bottom: 12px;
      padding-bottom: 12px;

      h2 {
        margin: 0;
        font-size: 17px;
        font-weight: 500;
        color: #263238;
      }
    }

    .header-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-content {
      padding: 12px 24px;
    }

    .section-label {
      margin: 0 0 10px;
      color: #607d8b;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .current-status {
      margin-bottom: 16px;

      .status-chip {
        font-size: 12px;
        padding: 6px 12px;
        font-weight: 500;
      }
    }

    .appointment-info {
      background: #fafafa;
      border-radius: 3px;
      padding: 12px;
      margin-bottom: 16px;
      border: 1px solid #eceff1;

      .info-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;

        &:last-child {
          margin-bottom: 0;
        }

        mat-icon {
          color: #78909c;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        span {
          color: #37474f;
          font-size: 13px;
        }
      }
    }

    .content-divider {
      margin: 16px 0;
    }

    .status-options {
      .option-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .status-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        text-align: left;
        justify-content: flex-start;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
        transition: all 0.15s ease;
        background: #ffffff;

        &.selected {
          border-color: #37474f;
          background: #eceff1;
        }

        &:not(.selected) {
          background-color: white;
          color: #263238;
        }

        &:hover:not(.selected) {
          background: #fafafa;
        }

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .option-label {
          font-size: 14px;
          font-weight: 500;
        }

        .option-hint {
          font-size: 11px;
          color: #78909c;
        }

        &.completed.selected {
          background-color: #e8f5e9;
          border-color: #43a047;
          color: #263238;
        }

        &.cancelled.selected {
          background-color: #ffebee;
          border-color: #d32f2f;
          color: #263238;
        }
      }
    }

    .no-options {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #eceff1;
      border-radius: 3px;

      .info-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: #455a64;
        margin-bottom: 10px;
      }

      p {
        margin: 0 0 6px;
        color: #263238;
        font-size: 14px;
      }

      .hint {
        font-size: 12px;
        color: #78909c;
      }
    }

    .dialog-actions {
      padding: 12px 24px;
      gap: 8px;
      border-top: 1px solid #eceff1;
      background: #fafafa;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: auto;
        max-width: 100%;
      }

      .status-option {
        width: 100%;
      }
    }
  `]
})
export class AppointmentStatusUpdateDialogComponent {
  selectedStatus: AppointmentStatus | null = null;
  updating = false;

  // Expose enum to template
  AppointmentStatus = AppointmentStatus;

  constructor(
    public dialogRef: MatDialogRef<AppointmentStatusUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentStatusUpdateDialogData,
    private appointmentService: AppointmentService,
    private errorHandler: ErrorHandlerService
  ) {}

  onConfirm(): void {
    if (!this.selectedStatus) {
      return;
    }

    this.updating = true;

    const updateRequest: AppointmentUpdateRequest = {
      status: this.selectedStatus
    };

    this.appointmentService.updateAppointment(this.data.appointment.id, updateRequest)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.updating = false)
      )
      .subscribe(result => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
  }

  onCancel(): void {
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

  getStatusIcon(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'schedule';
      case AppointmentStatus.COMPLETED:
        return 'check_circle';
      case AppointmentStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  }
}
