import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { Appointment, AppointmentStatus } from '../../../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event_note</mat-icon>
      Appointment Details
    </h2>
    
    <mat-dialog-content>
      <div class="detail-container">
        <!-- Status -->
        <div class="detail-row status-row">
          <mat-chip [color]="getStatusColor(data.status)" selected>
            {{ data.status }}
          </mat-chip>
        </div>

        <mat-divider></mat-divider>

        <!-- Doctor -->
        <div class="detail-row">
          <mat-icon color="primary">person</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">{{ data.doctorName }}</span>
          </div>
        </div>

        <!-- Date & Time -->
        <div class="detail-row">
          <mat-icon color="primary">schedule</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">{{ formatDate(data.appointmentDate) }}</span>
          </div>
        </div>

        <!-- Reason -->
        <div class="detail-row">
          <mat-icon color="primary">assignment</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Reason</span>
            <span class="detail-value">{{ data.reason }}</span>
          </div>
        </div>

        <mat-divider *ngIf="data.notes"></mat-divider>

        <!-- Notes -->
        <div class="detail-row" *ngIf="data.notes">
          <mat-icon color="primary">notes</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Notes</span>
            <span class="detail-value notes-value">{{ data.notes }}</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Appointment ID -->
        <div class="detail-row">
          <mat-icon color="primary">tag</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Appointment ID</span>
            <span class="detail-value">#{{ data.id }}</span>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button color="primary" (click)="onClose()">
        <mat-icon>close</mat-icon>
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #e65100;
      font-size: 22px;
      font-weight: 700;

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
      min-width: 400px;
      background: linear-gradient(180deg, #fff8e1 0%, #ffffff 100%);
      border-radius: 20px;
      margin: 8px 16px;
    }

    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: rgba(255, 255, 255, 0.9);
      padding: 12px 16px;
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.02);
      }

      mat-icon {
        margin-top: 2px;
        color: #ff8f00;
        font-size: 24px;
      }
    }

    .status-row {
      justify-content: center;
      padding: 14px;
      background: rgba(255, 243, 224, 0.6);
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .detail-label {
      font-size: 12px;
      color: #bf360c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }

    .detail-value {
      font-size: 17px;
      color: #3e2723;
      font-weight: 600;
    }

    .notes-value {
      white-space: pre-wrap;
      line-height: 1.5;
      color: #5d4037;
    }

    mat-dialog-actions {
      padding: 16px 24px;

      button {
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

    ::ng-deep .mat-mdc-chip.mat-primary {
      background: linear-gradient(90deg, #42a5f5, #1e88e5) !important;
      color: white !important;
    }
    ::ng-deep .mat-mdc-chip.mat-accent {
      background: linear-gradient(90deg, #66bb6a, #43a047) !important;
      color: white !important;
    }
    ::ng-deep .mat-mdc-chip.mat-warn {
      background: linear-gradient(90deg, #ef5350, #d32f2f) !important;
      color: white !important;
    }
  `]
})
export class AppointmentDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Appointment
  ) {}

  onClose(): void {
    this.dialogRef.close();
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
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
