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
      
      mat-icon {
        color: #666;
      }
    }

    mat-dialog-content {
      padding-top: 16px;
      min-width: 400px;
    }

    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      mat-icon {
        margin-top: 2px;
      }
    }

    .status-row {
      justify-content: center;
      padding: 8px 0;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .detail-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 16px;
      color: #333;
    }

    .notes-value {
      white-space: pre-wrap;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
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
