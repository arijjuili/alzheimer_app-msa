import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelButtonText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.confirmButtonColor || 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmButtonText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 350px;
      max-width: 500px;
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

    .dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #f57c00;
    }

    .dialog-content {
      padding: 16px 24px;

      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.7);
        line-height: 1.5;
      }
    }

    .dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
