import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MemoryItem, MemoryType } from '../../../../shared/models/memory.model';
import { Role } from '../../../../shared/models/user.model';
import { MemoryService } from '../../services/memory.service';
import { PatientService } from '../../../profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MemoryCreateDialogComponent, MemoryCreateDialogData } from '../dialogs/memory-create-dialog.component';
import { MemoryDetailDialogComponent, MemoryDetailDialogData } from '../dialogs/memory-detail-dialog.component';

@Component({
  selector: 'app-memories-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './memories-gallery.component.html',
  styleUrls: ['./memories-gallery.component.scss']
})
export class MemoriesGalleryComponent implements OnInit {
  memories: MemoryItem[] = [];
  filteredMemories: MemoryItem[] = [];
  loading = false;
  selectedType: MemoryType | 'ALL' = 'ALL';
  currentPatientId: string | null = null;
  private currentUserId: string | null = null;

  memoryTypes: MemoryType[] = [MemoryType.PHOTO, MemoryType.VIDEO, MemoryType.AUDIO, MemoryType.NOTE];

  constructor(
    private memoryService: MemoryService,
    private patientService: PatientService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      const user = this.authService.getCurrentUser();
      this.currentUserId = user?.id || null;
      this.currentPatientId = patient?.id || user?.id || null;
      this.loadMemories();
    });
  }

  loadMemories(): void {
    if (!this.currentPatientId) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.memoryService.getMemoriesByPatient(this.currentPatientId)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading = false)
      )
      .subscribe(memories => {
        this.memories = memories;
        this.applyFilter(this.selectedType);
      });
  }

  applyFilter(type: MemoryType | 'ALL'): void {
    this.selectedType = type;
    if (type === 'ALL') {
      this.filteredMemories = [...this.memories];
    } else {
      this.filteredMemories = this.memories.filter(m => m.memoryType === type);
    }
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

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MemoryCreateDialogComponent, {
      width: '600px',
      data: { patientId: this.currentPatientId || undefined } as MemoryCreateDialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMemories();
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
    return memory.patientId === this.currentUserId || this.authService.hasRole(Role.ADMIN);
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
              this.loadMemories();
            }
          });
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
