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
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { Routine, RoutineFrequency, UpdateRoutineRequest } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-routine-edit-dialog',
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
    MatSlideToggleModule
  ],
  templateUrl: './routine-edit-dialog.component.html',
  styleUrls: ['./routine-edit-dialog.component.scss']
})
export class RoutineEditDialogComponent implements OnInit {
  routineForm!: FormGroup;
  frequencies = [
    { value: RoutineFrequency.DAILY, label: 'Daily' },
    { value: RoutineFrequency.WEEKLY, label: 'Weekly' },
    { value: RoutineFrequency.MONTHLY, label: 'Monthly' }
  ];

  constructor(
    private fb: FormBuilder,
    private routineService: RoutineService,
    private errorHandler: ErrorHandlerService,
    public dialogRef: MatDialogRef<RoutineEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Routine
  ) {}

  ngOnInit(): void {
    this.routineForm = this.fb.group({
      title: [this.data.title, [Validators.required, Validators.maxLength(150)]],
      description: [this.data.description || '', [Validators.maxLength(1000)]],
      frequency: [this.data.frequency, [Validators.required]],
      timeOfDay: [this.data.timeOfDay || ''],
      isActive: [this.data.isActive]
    });
  }

  onSubmit(): void {
    if (this.routineForm.valid) {
      const formValue = this.routineForm.value;
      const request: UpdateRoutineRequest = {
        title: formValue.title,
        description: formValue.description || undefined,
        frequency: formValue.frequency,
        timeOfDay: formValue.timeOfDay || undefined,
        isActive: formValue.isActive
      };

      this.routineService.updateRoutine(this.data.id, request)
        .pipe(
          catchError(err => {
            this.errorHandler.handleError(err);
            return of(null);
          })
        )
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
}
