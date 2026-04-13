import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { CommunityPost } from '../../../../shared/models/community.model';

export interface PostDetailDialogData {
  post: CommunityPost;
}

@Component({
  selector: 'app-post-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './post-detail-dialog.component.html',
  styleUrls: ['./post-detail-dialog.component.scss']
})
export class PostDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PostDetailDialogData) {}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
