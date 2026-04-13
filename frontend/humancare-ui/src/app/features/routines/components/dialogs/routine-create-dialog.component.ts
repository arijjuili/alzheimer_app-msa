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

import { RoutineFrequency, CreateRoutineRequest } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

export interface RoutineCreateDialogData {
  patientId?: string;
}

@Component({
  selector: 'app-routine-create-dialog',
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
  templateUrl: './routine-create-dialog.component.html',
  styleUrls: ['./routine-create-dialog.component.scss']
})
export class RoutineCreateDialogComponent implements OnInit {
  routineForm!: FormGroup;
  frequencies = [
    { value: RoutineFrequency.DAILY, label: 'Daily' },
    { value: RoutineFrequency.WEEKLY, label: 'Weekly' },
    { value: RoutineFrequency.MONTHLY, label: 'Monthly' }
  ];
  patientId?: string;

  constructor(
    private fb: FormBuilder,
    private routineService: RoutineService,
    private errorHandler: ErrorHandlerService,
    public dialogRef: MatDialogRef<RoutineCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: RoutineCreateDialogData
  ) {
    this.patientId = data?.patientId;
  }

  ngOnInit(): void {
    this.routineForm = this.fb.group({
      patientId: [this.patientId || '', this.patientId ? [] : [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(1000)]],
      frequency: [RoutineFrequency.DAILY, [Validators.required]],
      timeOfDay: ['']
    });
  }

  isPatientIdReadOnly(): boolean {
    return !!this.patientId;
  }

  onSubmit(): void {
    if (this.routineForm.valid) {
      const formValue = this.routineForm.value;
      const request: CreateRoutineRequest = {
        patientId: formValue.patientId,
        title: formValue.title,
        description: formValue.description || undefined,
        frequency: formValue.frequency,
        timeOfDay: formValue.timeOfDay || undefined
      };

      this.routineService.createRoutine(request)
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
