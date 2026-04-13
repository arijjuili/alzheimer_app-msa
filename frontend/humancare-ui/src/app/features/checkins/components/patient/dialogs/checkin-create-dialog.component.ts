import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MoodType, SleepQuality, CreateDailyCheckinRequest, SymptomCheckRequest } from '../../../../../shared/models/checkin.model';
import { CheckinService } from '../../../services/checkin.service';

export interface CheckinCreateDialogData {
  patientId: string;
}

@Component({
  selector: 'app-checkin-create-dialog',
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
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './checkin-create-dialog.component.html',
  styleUrls: ['./checkin-create-dialog.component.scss']
})
export class CheckinCreateDialogComponent implements OnInit {
  checkinForm!: FormGroup;
  loading = false;
  moodOptions = Object.values(MoodType);
  sleepOptions = Object.values(SleepQuality);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckinCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckinCreateDialogData,
    private checkinService: CheckinService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.checkinForm = this.fb.group({
      mood: ['', Validators.required],
      energyLevel: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      sleepQuality: ['', Validators.required],
      notes: [''],
      checkinDate: [today, Validators.required],
      symptoms: this.fb.array([])
    });
  }

  get symptoms(): FormArray {
    return this.checkinForm.get('symptoms') as FormArray;
  }

  addSymptom(): void {
    const symptomGroup = this.fb.group({
      symptomType: ['', Validators.required],
      severity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      present: [true, Validators.required],
      notes: ['']
    });
    this.symptoms.push(symptomGroup);
  }

  removeSymptom(index: number): void {
    this.symptoms.removeAt(index);
  }

  onSubmit(): void {
    if (this.checkinForm.invalid) {
      return;
    }

    const formValue = this.checkinForm.value;
    const symptoms: SymptomCheckRequest[] = (formValue.symptoms || []).map((s: any) => ({
      symptomType: s.symptomType,
      severity: s.severity,
      present: s.present,
      notes: s.notes || undefined
    }));

    const request: CreateDailyCheckinRequest = {
      patientId: this.data.patientId,
      mood: formValue.mood,
      energyLevel: formValue.energyLevel,
      sleepQuality: formValue.sleepQuality,
      notes: formValue.notes || undefined,
      checkinDate: formValue.checkinDate,
      symptoms: symptoms.length > 0 ? symptoms : undefined
    };

    this.loading = true;
    this.checkinService.createCheckin(request)
      .pipe(
        catchError(err => {
          // Let caller handle error or just log it
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
