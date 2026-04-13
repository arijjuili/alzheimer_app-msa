import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommunityPost, PostCategory, UpdatePostRequest } from '../../../../shared/models/community.model';
import { CommunityService } from '../../services/community.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface PostEditDialogData {
  post: CommunityPost;
}

@Component({
  selector: 'app-post-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './post-edit-dialog.component.html',
  styleUrls: ['./post-edit-dialog.component.scss']
})
export class PostEditDialogComponent implements OnInit {
  postForm!: FormGroup;
  loading = false;
  categories = Object.values(PostCategory);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PostEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostEditDialogData,
    private communityService: CommunityService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: [this.data.post.title, [Validators.required, Validators.maxLength(150)]],
      content: [this.data.post.content, [Validators.required, Validators.maxLength(2000)]],
      category: [this.data.post.category, [Validators.required]],
      isActive: [this.data.post.isActive]
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    this.loading = true;
    const request: UpdatePostRequest = {
      title: this.postForm.value.title,
      content: this.postForm.value.content,
      category: this.postForm.value.category,
      isActive: this.postForm.value.isActive
    };

    this.communityService.updatePost(this.data.post.id, request)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Post updated successfully');
          this.dialogRef.close(true);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
