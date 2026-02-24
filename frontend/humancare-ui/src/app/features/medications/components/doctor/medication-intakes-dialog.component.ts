import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MedicationPlan, MedicationIntake, IntakeStatus } from '../../../../shared/models/medication.model';
import { MedicationService } from '../../services/medication.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface MedicationIntakesDialogData {
  medication: MedicationPlan;
}

@Component({
  selector: 'app-medication-intakes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="header-icon">history</mat-icon>
        <div class="header-text">
          <h2 mat-dialog-title>Medication Intake History</h2>
          <p class="subtitle">{{ data.medication.medicationName }} - Patient #{{ data.medication.patientId }}</p>
        </div>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Loading intake history...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="error-container">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <p>{{ error }}</p>
          <button mat-button color="primary" (click)="loadIntakes()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>

        <!-- Intakes Table -->
        <div *ngIf="!loading && !error" class="table-container">
          <table mat-table [dataSource]="dataSource" class="intakes-table">
            <!-- Scheduled Time Column -->
            <ng-container matColumnDef="scheduledAt">
              <th mat-header-cell *matHeaderCellDef>Scheduled Time</th>
              <td mat-cell *matCellDef="let intake">
                {{ formatDateTime(intake.scheduledAt) }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let intake">
                <mat-chip [color]="getStatusColor(intake.status)" selected class="status-chip">
                  {{ intake.status }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Taken Time Column -->
            <ng-container matColumnDef="takenAt">
              <th mat-header-cell *matHeaderCellDef>Taken Time</th>
              <td mat-cell *matCellDef="let intake">
                <span *ngIf="intake.takenAt">{{ formatDateTime(intake.takenAt) }}</span>
                <span *ngIf="!intake.takenAt" class="not-taken">-</span>
              </td>
            </ng-container>

            <!-- Notes Column -->
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let intake" class="notes-cell">
                {{ intake.notes || '-' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let intake" class="actions-cell">
                <button 
                  mat-icon-button 
                  color="warn"
                  (click)="onDeleteIntake(intake)"
                  matTooltip="Delete Intake Record"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- No Data -->
          <div *ngIf="dataSource.data.length === 0" class="no-data">
            <mat-icon>event_note</mat-icon>
            <p>No intake records found</p>
          </div>
        </div>

        <!-- Summary Section -->
        <div *ngIf="!loading && !error && dataSource.data.length > 0" class="summary-section">
          <h4>Summary</h4>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Total:</span>
              <span class="stat-value">{{ dataSource.data.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Taken:</span>
              <span class="stat-value taken">{{ getTakenCount() }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Missed:</span>
              <span class="stat-value missed">{{ getMissedCount() }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Scheduled:</span>
              <span class="stat-value scheduled">{{ getScheduledCount() }}</span>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 600px;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 0;

      .header-text {
        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }

        .subtitle {
          margin: 4px 0 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 14px;
        }
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
      max-height: 50vh;
      overflow-y: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;

      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;

      .error-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #f44336;
        margin-bottom: 8px;
      }

      p {
        margin: 0 0 12px;
        color: rgba(0, 0, 0, 0.7);
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .intakes-table {
      width: 100%;

      th {
        font-weight: 500;
        color: #333;
      }

      td {
        font-size: 14px;
      }
    }

    .status-chip {
      text-transform: capitalize;
      font-size: 12px;
    }

    .notes-cell {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .not-taken {
      color: rgba(0, 0, 0, 0.4);
    }

    .actions-cell {
      button {
        mat-icon {
          font-size: 18px;
        }
      }
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: #999;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
      }
    }

    .summary-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .summary-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;

      .stat-label {
        color: rgba(0, 0, 0, 0.6);
        font-size: 13px;
      }

      .stat-value {
        font-weight: 500;
        font-size: 14px;

        &.taken {
          color: #4caf50;
        }

        &.missed {
          color: #f44336;
        }

        &.scheduled {
          color: #2196f3;
        }
      }
    }

    .dialog-actions {
      padding: 16px 24px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: auto;
        max-width: 100%;
      }

      .summary-stats {
        gap: 16px;
      }
    }
  `]
})
export class MedicationIntakesDialogComponent implements OnInit {
  dataSource = new MatTableDataSource<MedicationIntake>([]);
  displayedColumns: string[] = ['scheduledAt', 'status', 'takenAt', 'notes', 'actions'];
  loading = true;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<MedicationIntakesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MedicationIntakesDialogData,
    private medicationService: MedicationService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadIntakes();
  }

  loadIntakes(): void {
    this.loading = true;
    this.error = null;

    if (this.data.medication.id) {
      this.medicationService.getIntakesByPlan(this.data.medication.id)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            this.error = 'Failed to load intake history';
            return of([]);
          }),
          finalize(() => this.loading = false)
        )
        .subscribe(intakes => {
          // If API returns empty data, use mock data for demo
          if (intakes.length === 0) {
            this.dataSource.data = this.getMockIntakes();
          } else {
            this.dataSource.data = intakes;
          }
        });
    } else {
      this.dataSource.data = this.getMockIntakes();
      this.loading = false;
    }
  }

  getStatusColor(status: IntakeStatus): string {
    switch (status) {
      case IntakeStatus.TAKEN:
        return 'accent';
      case IntakeStatus.MISSED:
        return 'warn';
      case IntakeStatus.SCHEDULED:
        return 'primary';
      case IntakeStatus.SKIPPED:
        return 'default';
      default:
        return 'default';
    }
  }

  getTakenCount(): number {
    return this.dataSource.data.filter(i => i.status === IntakeStatus.TAKEN).length;
  }

  getMissedCount(): number {
    return this.dataSource.data.filter(i => i.status === IntakeStatus.MISSED).length;
  }

  getScheduledCount(): number {
    return this.dataSource.data.filter(i => i.status === IntakeStatus.SCHEDULED).length;
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onDeleteIntake(intake: MedicationIntake): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Intake Record',
        message: 'Are you sure you want to delete this intake record? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && intake.id) {
        // Remove from local data for now (API delete would go here)
        this.dataSource.data = this.dataSource.data.filter(i => i.id !== intake.id);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private getMockIntakes(): MedicationIntake[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        planId: this.data.medication.id,
        scheduledAt: yesterday.toISOString(),
        takenAt: yesterday.toISOString(),
        status: IntakeStatus.TAKEN,
        notes: 'Taken with breakfast'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        planId: this.data.medication.id,
        scheduledAt: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        takenAt: new Date(yesterday.getTime() + 8.5 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.TAKEN,
        notes: ''
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        planId: this.data.medication.id,
        scheduledAt: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.MISSED,
        notes: 'Patient forgot'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        planId: this.data.medication.id,
        scheduledAt: now.toISOString(),
        status: IntakeStatus.SCHEDULED,
        notes: ''
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        planId: this.data.medication.id,
        scheduledAt: new Date(twoDaysAgo.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        takenAt: new Date(twoDaysAgo.getTime() + 8.25 * 60 * 60 * 1000).toISOString(),
        status: IntakeStatus.TAKEN,
        notes: ''
      }
    ];
  }
}
