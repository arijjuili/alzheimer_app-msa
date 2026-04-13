import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { DailyCheckin, MoodType, SleepQuality } from '../../../../shared/models/checkin.model';

@Component({
  selector: 'app-checkin-detail-dialog',
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
  templateUrl: './checkin-detail-dialog.component.html',
  styleUrls: ['./checkin-detail-dialog.component.scss']
})
export class CheckinDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CheckinDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DailyCheckin
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getMoodColor(mood: MoodType): string {
    switch (mood) {
      case MoodType.EXCELLENT: return 'primary';
      case MoodType.GOOD: return 'accent';
      case MoodType.FAIR: return '';
      case MoodType.POOR: return 'warn';
      case MoodType.BAD: return 'warn';
      default: return '';
    }
  }

  getSleepColor(sleep: SleepQuality): string {
    switch (sleep) {
      case SleepQuality.GREAT: return 'primary';
      case SleepQuality.GOOD: return 'accent';
      case SleepQuality.FAIR: return '';
      case SleepQuality.POOR: return 'warn';
      case SleepQuality.BAD: return 'warn';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
