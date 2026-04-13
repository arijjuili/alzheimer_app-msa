import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MemoryItem, MemoryType } from '../../../../shared/models/memory.model';
import { Role } from '../../../../shared/models/user.model';
import { MemoryService } from '../../services/memory.service';
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
    MatTooltipModule
  ],
  templateUrl: './memories-list.component.html',
  styleUrls: ['./memories-list.component.scss']
})
export class MemoriesListComponent implements OnInit {
  memories: MemoryItem[] = [];
  loading = false;
  page = 0;
  size = 20;
  totalElements = 0;
  displayedColumns: string[] = ['title', 'patientId', 'memoryType', 'memoryDate', 'actions'];

  private currentUserId: string | null = null;

  constructor(
    private memoryService: MemoryService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;
    this.loadMemories();
  }

  loadMemories(): void {
    this.loading = true;
    this.memoryService.getAllMemories(this.page, this.size)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading = false)
      )
      .subscribe(memories => {
        this.memories = memories;
        this.totalElements = memories.length;
      });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadMemories();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MemoryCreateDialogComponent, {
      width: '600px'
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

  getTypeIcon(type: MemoryType): string {
    switch (type) {
      case MemoryType.PHOTO: return 'image';
      case MemoryType.VIDEO: return 'videocam';
      case MemoryType.AUDIO: return 'audiotrack';
      case MemoryType.NOTE: return 'note';
      default: return 'help';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
