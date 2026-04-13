import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { MemoryItem, MemoryType } from '../../../../shared/models/memory.model';
import { Role } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { MemoryEditDialogComponent, MemoryEditDialogData } from './memory-edit-dialog.component';

export interface MemoryDetailDialogData {
  memory: MemoryItem;
}

@Component({
  selector: 'app-memory-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './memory-detail-dialog.component.html',
  styleUrls: ['./memory-detail-dialog.component.scss']
})
export class MemoryDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MemoryDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemoryDetailDialogData,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

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

  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    return this.data.memory.patientId === user?.id || this.authService.hasRole(Role.ADMIN);
  }

  openEdit(): void {
    this.dialogRef.close();
    this.dialog.open(MemoryEditDialogComponent, {
      width: '600px',
      data: { memory: this.data.memory } as MemoryEditDialogData
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
