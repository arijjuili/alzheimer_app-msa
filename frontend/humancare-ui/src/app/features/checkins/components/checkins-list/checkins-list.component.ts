import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { DailyCheckin, MoodType, SleepQuality } from '../../../../shared/models/checkin.model';
import { CheckinService } from '../../services/checkin.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { CheckinDetailDialogComponent } from '../dialogs/checkin-detail-dialog.component';

@Component({
  selector: 'app-checkins-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './checkins-list.component.html',
  styleUrls: ['./checkins-list.component.scss']
})
export class CheckinsListComponent implements OnInit {
  dataSource = new MatTableDataSource<DailyCheckin>([]);
  displayedColumns: string[] = ['checkinDate', 'patientId', 'mood', 'energyLevel', 'sleepQuality', 'actions'];
  loading = false;
  page = 0;
  size = 20;
  totalElements = 0;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private checkinService: CheckinService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCheckins();
  }

  loadCheckins(): void {
    this.loading = true;
    this.error = null;

    this.checkinService.getAllCheckins(this.page, this.size)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load check-ins';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(checkins => {
        this.dataSource.data = checkins;
        // Estimate total: if we got a full page, assume there may be more
        if (checkins.length === this.size) {
          this.totalElements = (this.page + 1) * this.size + 1;
        } else {
          this.totalElements = this.page * this.size + checkins.length;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadCheckins();
  }

  openDetailDialog(checkin: DailyCheckin): void {
    this.dialog.open(CheckinDetailDialogComponent, {
      width: '500px',
      data: checkin
    });
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
