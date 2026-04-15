import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MemoryItem, MemoryType } from '../../../../shared/models/memory.model';
import { Patient } from '../../../../shared/models/patient.model';
import { Role } from '../../../../shared/models/user.model';
import { MemoryService } from '../../services/memory.service';
import { PatientService } from '../../../../features/profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MemoryCreateDialogComponent, MemoryCreateDialogData } from '../dialogs/memory-create-dialog.component';
import { MemoryDetailDialogComponent, MemoryDetailDialogData } from '../dialogs/memory-detail-dialog.component';

@Component({
  selector: 'app-memories-list',
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
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './memories-list.component.html',
  styleUrls: ['./memories-list.component.scss']
})
export class MemoriesListComponent implements OnInit {
  assignedPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  dataSource = new MatTableDataSource<MemoryItem & { patientName?: string }>([]);
  displayedColumns: string[] = ['title', 'patientName', 'memoryType', 'memoryDate', 'actions'];
  loading = false;
  page = 0;
  size = 20;
  totalElements = 0;

  loadingPatients = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private memoryService: MemoryService,
    private patientService: PatientService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAssignedPatients();
  }

  loadAssignedPatients(): void {
    this.loadingPatients = true;
    const currentUser = this.authService.getCurrentUser();
    const caregiverId = currentUser?.id;

    this.patientService.getPatients(1, 1000)
      .pipe(
        catchError(err => {
          return of({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
        }),
        finalize(() => this.loadingPatients = false)
      )
      .subscribe(response => {
        this.assignedPatients = caregiverId
          ? response.data.filter(p => p.caregiverId === caregiverId)
          : response.data;
        if (this.assignedPatients.length > 0) {
          this.selectPatient(this.assignedPatients[0]);
        } else {
          this.loadAllMemories();
        }
      });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.page = 0;
    this.loadMemoriesForPatient(patient.id);
  }

  loadMemoriesForPatient(patientId: string): void {
    this.loading = true;
    this.memoryService.getMemoriesByPatient(patientId, this.page, this.size)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading = false)
      )
      .subscribe(memories => {
        this.dataSource.data = this.enrichMemories(memories);
        this.totalElements = memories.length;
      });
  }

  loadAllMemories(): void {
    this.loading = true;
    this.memoryService.getAllMemories(this.page, this.size)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading = false)
      )
      .subscribe(memories => {
        this.dataSource.data = this.enrichMemories(memories);
        this.totalElements = memories.length;
      });
  }

  private enrichMemories(memories: MemoryItem[]): (MemoryItem & { patientName?: string })[] {
    return memories.map(m => ({
      ...m,
      patientName: this.getPatientName(m.patientId)
    }));
  }

  getPatientName(patientId: string): string {
    const patient = this.assignedPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : patientId;
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    if (this.selectedPatient) {
      this.loadMemoriesForPatient(this.selectedPatient.id);
    } else {
      this.loadAllMemories();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MemoryCreateDialogComponent, {
      width: '600px',
      data: {
        patientId: this.selectedPatient?.id,
        patients: this.assignedPatients.length ? this.assignedPatients : undefined,
        professional: true
      } as MemoryCreateDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.selectedPatient) {
          this.loadMemoriesForPatient(this.selectedPatient.id);
        } else {
          this.loadAllMemories();
        }
      }
    });
  }

  openDetailDialog(memory: MemoryItem): void {
    this.dialog.open(MemoryDetailDialogComponent, {
      width: '600px',
      data: { memory } as MemoryDetailDialogData
    });
  }

  canDelete(memory: MemoryItem): boolean {
    return memory.patientId === this.authService.getCurrentUser()?.id || this.authService.hasRole(Role.ADMIN);
  }

  deleteMemory(memory: MemoryItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Memory',
        message: 'Are you sure you want to delete this memory? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memoryService.deleteMemory(memory.id)
          .pipe(catchError(() => of(null)))
          .subscribe(res => {
            if (res !== null) {
              if (this.selectedPatient) {
                this.loadMemoriesForPatient(this.selectedPatient.id);
              } else {
                this.loadAllMemories();
              }
            }
          });
      }
    });
  }

  getTypeIcon(type: MemoryType): string {
    switch (type) {
      case MemoryType.PHOTO: return 'image';
      case MemoryType.VIDEO: return 'videocam';
      case MemoryType.AUDIO: return 'audiotrack';
      case MemoryType.NOTE: return 'note';
      default: return 'help';
    }
  }

  getTypeColor(type: MemoryType): string {
    switch (type) {
      case MemoryType.PHOTO: return 'accent';
      case MemoryType.VIDEO: return 'warn';
      case MemoryType.AUDIO: return 'primary';
      case MemoryType.NOTE: return '';
      default: return '';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
