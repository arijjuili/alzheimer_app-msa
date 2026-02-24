import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { MedicationPlan, MedicationIntake, IntakeStatus, MedicationForm } from '../../../../shared/models/medication.model';

interface DialogData {
  plan: MedicationPlan;
  intakes: MedicationIntake[];
}

@Component({
  selector: 'app-medication-detail-dialog',
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
      <mat-icon>medication</mat-icon>
      {{ data.plan.medicationName }}
    </h2>
    
    <mat-dialog-content>
      <div class="detail-container">
        <!-- Status -->
        <div class="detail-row status-row">
          <mat-chip [color]="getStatusColor(data.plan.active)" selected>
            {{ data.plan.active ? 'Active' : 'Inactive' }}
          </mat-chip>
        </div>

        <mat-divider></mat-divider>

        <!-- Dosage -->
        <div class="detail-row">
          <mat-icon color="primary">straighten</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Dosage</span>
            <span class="detail-value">{{ data.plan.dosage }}</span>
          </div>
        </div>

        <!-- Form -->
        <div class="detail-row">
          <mat-icon color="primary">category</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Form</span>
            <span class="detail-value">{{ formatForm(data.plan.form) }}</span>
          </div>
        </div>

        <!-- Frequency -->
        <div class="detail-row">
          <mat-icon color="primary">repeat</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Frequency</span>
            <span class="detail-value">{{ data.plan.frequencyPerDay }} times per day</span>
          </div>
        </div>

        <!-- Dates -->
        <div class="detail-row">
          <mat-icon color="primary">calendar_today</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Duration</span>
            <span class="detail-value">
              {{ formatDate(data.plan.startDate) }}
              <span *ngIf="data.plan.endDate"> - {{ formatDate(data.plan.endDate) }}</span>
              <span *ngIf="!data.plan.endDate"> (Ongoing)</span>
            </span>
          </div>
        </div>

        <!-- Instructions -->
        <ng-container *ngIf="data.plan.instructions">
          <mat-divider></mat-divider>
          <div class="detail-row">
            <mat-icon color="primary">notes</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Instructions</span>
              <span class="detail-value notes-value">{{ data.plan.instructions }}</span>
            </div>
          </div>
        </ng-container>

        <!-- Recent Intakes -->
        <mat-divider></mat-divider>
        <div class="intakes-section">
          <div class="detail-row">
            <mat-icon color="primary">schedule</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Recent Intakes</span>
            </div>
          </div>
          
          <div *ngIf="data.intakes?.length" class="intakes-list">
            <div *ngFor="let intake of getRecentIntakes()" class="intake-item">
              <span class="intake-time">{{ formatDateTime(intake.scheduledAt) }}</span>
              <mat-chip [ngClass]="'status-' + intake.status.toLowerCase()" selected class="intake-status">
                {{ intake.status }}
              </mat-chip>
            </div>
          </div>
          
          <div *ngIf="!data.intakes?.length" class="no-intakes">
            <p>No intake records available</p>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Plan ID -->
        <div class="detail-row">
          <mat-icon color="primary">tag</mat-icon>
          <div class="detail-content">
            <span class="detail-label">Plan ID</span>
            <span class="detail-value">#{{ data.plan.id }}</span>
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

    .intakes-section {
      .detail-row {
        margin-bottom: 8px;
      }
    }

    .intakes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 40px;
    }

    .intake-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;

      .intake-time {
        font-size: 14px;
        color: #333;
      }

      .intake-status {
        font-size: 12px;
        min-height: 24px;
      }
    }

    // Status chip colors
    ::ng-deep .status-taken {
      background-color: #69f0ae !important;
      color: #000 !important;
    }

    ::ng-deep .status-missed {
      background-color: #f44336 !important;
      color: #fff !important;
    }

    ::ng-deep .status-skipped {
      background-color: #ff9800 !important;
      color: #000 !important;
    }

    ::ng-deep .status-scheduled {
      background-color: #1976d2 !important;
      color: #fff !important;
    }

    .no-intakes {
      margin-left: 40px;
      padding: 16px;
      text-align: center;
      color: #999;

      p {
        margin: 0;
      }
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
export class MedicationDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MedicationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getStatusColor(active: boolean | undefined): string {
    return active ? 'primary' : 'warn';
  }

  formatForm(form: MedicationForm): string {
    return form.charAt(0) + form.slice(1).toLowerCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRecentIntakes(): MedicationIntake[] {
    return (this.data.intakes || []).slice(0, 5);
  }
}
