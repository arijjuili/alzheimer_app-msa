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
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { MemoryType, CreateMemoryItemRequest } from '../../../../shared/models/memory.model';
import { MemoryService } from '../../services/memory.service';
import { PatientService } from '../../../profile/services/patient.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';
import { Role } from '../../../../shared/models/user.model';
import { NotificationTriggerService } from '../../../../shared/services/notification-trigger.service';

export interface MemoryCreateDialogData {
  patientId?: string;
  patients?: Patient[];
  professional?: boolean;
}

@Component({
  selector: 'app-memory-create-dialog',
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
  templateUrl: './memory-create-dialog.component.html',
  styleUrls: ['./memory-create-dialog.component.scss']
})
export class MemoryCreateDialogComponent implements OnInit {
  form!: FormGroup;
  memoryTypes = Object.values(MemoryType);
  patients: Patient[] = [];
  loadingPatients = false;
  isPatient = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MemoryCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemoryCreateDialogData,
    private memoryService: MemoryService,
    private patientService: PatientService,
    private authService: AuthService,
    private notificationTrigger: NotificationTriggerService
  ) {}

  ngOnInit(): void {
    this.isPatient = this.authService.hasRole(Role.PATIENT);
    if (this.data?.patients) {
      this.patients = this.data.patients;
    } else if (!this.isPatient && !this.data?.patientId) {
      this.loadPatients();
    }
    this.initForm();
  }

  loadPatients(): void {
    this.loadingPatients = true;
    this.patientService.getPatients(1, 100)
      .pipe(
        catchError(() => of({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
        finalize(() => this.loadingPatients = false)
      )
      .subscribe(response => {
        this.patients = response.data;
      });
  }

  initForm(): void {
    this.form = this.fb.group({
      patientId: [{ value: this.data?.patientId || '', disabled: !!this.data?.patientId }, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      memoryDate: [null],
      memoryType: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const request: CreateMemoryItemRequest = {
        patientId: raw.patientId,
        title: raw.title,
        description: raw.description || undefined,
        memoryDate: raw.memoryDate ? this.formatDate(raw.memoryDate) : undefined,
        memoryType: raw.memoryType
      };
      this.memoryService.createMemory(request)
        .pipe(catchError(() => of(null)))
        .subscribe(result => {
          if (result) {
            if (!this.isPatient && raw.patientId) {
              const caregiver = this.authService.getCurrentUser();
              this.notificationTrigger.memoryShared(
                raw.patientId,
                caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'Your caregiver'
              );
            }
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
