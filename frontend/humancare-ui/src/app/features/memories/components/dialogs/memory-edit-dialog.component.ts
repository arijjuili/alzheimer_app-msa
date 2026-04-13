import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MemoryItem, MemoryType, UpdateMemoryItemRequest } from '../../../../shared/models/memory.model';
import { MemoryService } from '../../services/memory.service';

export interface MemoryEditDialogData {
  memory: MemoryItem;
}

@Component({
  selector: 'app-memory-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './memory-edit-dialog.component.html',
  styleUrls: ['./memory-edit-dialog.component.scss']
})
export class MemoryEditDialogComponent implements OnInit {
  form!: FormGroup;
  memoryTypes = Object.values(MemoryType);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MemoryEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemoryEditDialogData,
    private memoryService: MemoryService
  ) {}

  ngOnInit(): void {
    const memory = this.data.memory;
    this.form = this.fb.group({
      title: [memory.title, [Validators.required, Validators.maxLength(200)]],
      description: [memory.description || '', [Validators.maxLength(2000)]],
      memoryDate: [memory.memoryDate ? new Date(memory.memoryDate) : null],
      memoryType: [memory.memoryType, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      const request: UpdateMemoryItemRequest = {
        title: value.title,
        description: value.description || undefined,
        memoryDate: value.memoryDate ? this.formatDate(value.memoryDate) : undefined,
        memoryType: value.memoryType
      };
      this.memoryService.updateMemory(this.data.memory.id, request)
        .pipe(catchError(() => of(null)))
        .subscribe(result => {
          if (result) {
            this.dialogRef.close(true);
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
