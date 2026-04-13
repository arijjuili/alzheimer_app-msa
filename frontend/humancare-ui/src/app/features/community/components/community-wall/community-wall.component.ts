import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommunityPost, PostCategory, Page } from '../../../../shared/models/community.model';
import { CommunityService } from '../../services/community.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../shared/models/user.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PostCreateDialogComponent } from '../dialogs/post-create-dialog.component';
import { PostEditDialogComponent } from '../dialogs/post-edit-dialog.component';
import { PostDetailDialogComponent } from '../dialogs/post-detail-dialog.component';

@Component({
  selector: 'app-community-wall',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './community-wall.component.html',
  styleUrls: ['./community-wall.component.scss']
})
export class CommunityWallComponent implements OnInit {
  posts: CommunityPost[] = [];
  loading = false;
  selectedCategory: string | null = null;
  page = 0;
  size = 20;
  totalElements = 0;

  categories = [
    PostCategory.GENERAL,
    PostCategory.SUPPORT,
    PostCategory.ADVICE,
    PostCategory.EVENT
  ];

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.communityService.getPosts(
      this.page,
      this.size,
      'createdAt,desc',
      undefined,
      this.selectedCategory || undefined
    )
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of<Page<CommunityPost>>({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((response: Page<CommunityPost>) => {
        this.posts = response.content || [];
        this.totalElements = response.totalElements || 0;
      });
  }

  onCategoryChange(category: string | null): void {
    this.selectedCategory = category;
    this.page = 0;
    this.loadPosts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadPosts();
  }

  openCreateDialog(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorHandler.showError('You must be logged in to create a post');
      return;
    }

    const dialogRef = this.dialog.open(PostCreateDialogComponent, {
      width: '600px',
      data: { authorId: currentUser.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  openDetailDialog(post: CommunityPost): void {
    this.dialog.open(PostDetailDialogComponent, {
      width: '600px',
      data: { post }
    });
  }

  canEditOrDelete(post: CommunityPost): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return false;
    }
    return post.authorId === currentUser.id || this.authService.hasRole(Role.ADMIN);
  }

  editPost(post: CommunityPost): void {
    const dialogRef = this.dialog.open(PostEditDialogComponent, {
      width: '600px',
      data: { post }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  deletePost(post: CommunityPost): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.communityService.deletePost(post.id)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(null);
            })
          )
          .subscribe(deleted => {
            if (deleted !== null) {
              this.loadPosts();
            }
          });
      }
    });
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content || content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

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
