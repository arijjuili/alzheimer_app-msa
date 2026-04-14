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
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { RoutineFrequency, CreateRoutineRequest, Routine } from '../../../../shared/models/routine.model';
import { RoutineService } from '../../services/routine.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { PatientService } from '../../../profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';

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
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './routine-create-dialog.component.html',
  styleUrls: ['./routine-create-dialog.component.scss']
})
export class RoutineCreateDialogComponent implements OnInit {
  routineForm!: FormGroup;
  frequencies = [
    { value: RoutineFrequency.DAILY, label: 'Daily', icon: 'today' },
    { value: RoutineFrequency.WEEKLY, label: 'Weekly', icon: 'date_range' },
    { value: RoutineFrequency.MONTHLY, label: 'Monthly', icon: 'calendar_month' }
  ];
  patientId?: string;
  patients: Patient[] = [];
  loadingPatients = true;

  constructor(
    private fb: FormBuilder,
    private routineService: RoutineService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    public dialogRef: MatDialogRef<RoutineCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: RoutineCreateDialogData
  ) {
    this.patientId = data?.patientId;
  }

  ngOnInit(): void {
    this.loadPatients();
    this.routineForm = this.fb.group({
      patientId: [this.patientId || '', this.patientId ? [] : [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(1000)]],
      frequency: [RoutineFrequency.DAILY, [Validators.required]],
      timeOfDay: ['']
    });
  }

  loadPatients(): void {
    this.loadingPatients = true;
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || null;

    this.patientService.getPatients(1, 1000).pipe(
      catchError(() => of({ data: [], total: 0 } as { data: Patient[], total: number }))
    ).subscribe(response => {
      if (this.authService.hasRole('ADMIN') || this.authService.hasRole('DOCTOR')) {
        this.patients = response.data || [];
      } else if (this.authService.hasRole('CAREGIVER') && userId) {
        this.patients = (response.data || []).filter(p => p.caregiverId === userId);
      }
      this.loadingPatients = false;
    });
  }

  isPatientIdReadOnly(): boolean {
    return !!this.patientId;
  }

  displayPatient(patient: Patient): string {
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
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

  comparePatients(p1: Patient, p2: Patient): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }
}
