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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Routine, RoutineFrequency } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoutineCreateDialogComponent } from '../dialogs/routine-create-dialog.component';
import { RoutineEditDialogComponent } from '../dialogs/routine-edit-dialog.component';

@Component({
  selector: 'app-routines-list',
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
    MatSnackBarModule
  ],
  templateUrl: './routines-list.component.html',
  styleUrls: ['./routines-list.component.scss']
})
export class RoutinesListComponent implements OnInit {
  dataSource = new MatTableDataSource<Routine>([]);
  displayedColumns: string[] = ['title', 'patientId', 'frequency', 'timeOfDay', 'isActive', 'actions'];
  loading = false;
  page = 0;
  size = 20;
  totalElements = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private routineService: RoutineService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoutines();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadRoutines(): void {
    this.loading = true;
    this.routineService.getAllRoutines(this.page, this.size)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(routines => {
        this.routines = routines;
        this.dataSource.data = routines;
        this.totalElements = routines.length;
      });
  }

  set routines(value: Routine[]) {
    this._routines = value;
  }

  get routines(): Routine[] {
    return this._routines;
  }

  private _routines: Routine[] = [];

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadRoutines();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RoutineCreateDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoutines();
      }
    });
  }

  openEditDialog(routine: Routine): void {
    const dialogRef = this.dialog.open(RoutineEditDialogComponent, {
      width: '600px',
      data: routine,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoutines();
      }
    });
  }

  deleteRoutine(routine: Routine): void {
    if (!routine.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Routine',
        message: `Are you sure you want to delete the routine "${routine.title}"? This action cannot be undone.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.routineService.deleteRoutine(routine.id!)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(void 0);
            })
          )
          .subscribe(() => {
            this.snackBar.open('Routine deleted', 'Close', { duration: 3000 });
            this.loadRoutines();
          });
      }
    });
  }

  getFrequencyLabel(frequency: RoutineFrequency): string {
    switch (frequency) {
      case RoutineFrequency.DAILY:
        return 'Daily';
      case RoutineFrequency.WEEKLY:
        return 'Weekly';
      case RoutineFrequency.MONTHLY:
        return 'Monthly';
      default:
        return frequency;
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
