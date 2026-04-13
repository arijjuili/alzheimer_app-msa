import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PostCategory, CreatePostRequest } from '../../../../shared/models/community.model';
import { CommunityService } from '../../services/community.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface PostCreateDialogData {
  authorId: string;
}

@Component({
  selector: 'app-post-create-dialog',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './post-create-dialog.component.html',
  styleUrls: ['./post-create-dialog.component.scss']
})
export class PostCreateDialogComponent implements OnInit {
  postForm!: FormGroup;
  loading = false;
  categories = Object.values(PostCategory);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PostCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostCreateDialogData,
    private communityService: CommunityService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      content: ['', [Validators.required, Validators.maxLength(2000)]],
      category: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    this.loading = true;
    const request: CreatePostRequest = {
      authorId: this.data.authorId,
      title: this.postForm.value.title,
      content: this.postForm.value.content,
      category: this.postForm.value.category
    };

    this.communityService.createPost(request)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Post created successfully');
          this.dialogRef.close(true);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
