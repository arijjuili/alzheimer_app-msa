import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { PatientService } from '../../../profile/services/patient.service';
import { UserRegistrationRequest, UserRole } from '../../../../shared/models/patient.model';

export interface PatientCreateDialogData {
  title?: string;
  defaultRole?: UserRole;
}

export interface CreatePatientResult {
  success: boolean;
  userId?: string;
  role?: UserRole;
}

interface RoleOption {
  value: UserRole;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-patient-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './patient-create-dialog.component.html',
  styleUrls: ['./patient-create-dialog.component.scss']
})
export class PatientCreateDialogComponent {
  isLoading = false;
  hidePassword = true;
  readonly userForm: FormGroup;

  readonly roleOptions: RoleOption[] = [
    {
      value: 'PATIENT',
      label: 'Patient',
      icon: 'personal_injury',
      description: 'Medical profile, emergency details, and care-team assignment readiness.'
    },
    {
      value: 'CAREGIVER',
      label: 'Caregiver',
      icon: 'diversity_3',
      description: 'Day-to-day support contact ready to be assigned to patients.'
    },
    {
      value: 'DOCTOR',
      label: 'Doctor',
      icon: 'medical_services',
      description: 'Clinical account for appointments, prescriptions, and patient ownership.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private dialogRef: MatDialogRef<PatientCreateDialogComponent, CreatePatientResult>,
    @Inject(MAT_DIALOG_DATA) public data: PatientCreateDialogData
  ) {
    this.userForm = this.fb.group({
      role: [this.data.defaultRole ?? 'PATIENT', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/)
      ]],
      phone: [''],
      dateOfBirth: [''],
      address: [''],
      emergencyContact: [''],
      medicalHistory: ['']
    });

    this.userForm.get('email')?.valueChanges.subscribe(() => this.clearServerError('email'));
    this.userForm.get('username')?.valueChanges.subscribe(() => this.clearServerError('username'));
  }

  get selectedRole(): UserRole {
    return this.userForm.get('role')?.value as UserRole;
  }

  get selectedRoleMeta(): RoleOption {
    return this.roleOptions.find(option => option.value === this.selectedRole) ?? this.roleOptions[0];
  }

  get isPatientRole(): boolean {
    return this.selectedRole === 'PATIENT';
  }

  get submitLabel(): string {
    switch (this.selectedRole) {
      case 'CAREGIVER':
        return 'Create Caregiver';
      case 'DOCTOR':
        return 'Create Doctor';
      case 'PATIENT':
      default:
        return 'Create Patient';
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.userForm.value;

    const payload: UserRegistrationRequest = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      password: formValue.password,
      role: formValue.role,
      phone: formValue.phone || undefined,
      ...(formValue.role === 'PATIENT' ? {
        dateOfBirth: formValue.dateOfBirth ? this.formatDate(formValue.dateOfBirth) : undefined,
        address: formValue.address || undefined,
        emergencyContact: formValue.emergencyContact || undefined,
        medicalHistory: formValue.medicalHistory || undefined
      } : {})
    };

    this.patientService.registerUser(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.errorHandler.showSuccess(`${this.selectedRoleMeta.label} account created successfully`);
        this.dialogRef.close({ success: true, userId: response.userId, role: response.role });
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || error.message || 'Failed to create user account';
        this.applyConflictErrors(message);
        this.errorHandler.showError(message);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['serverDuplicate']) return control.errors['serverDuplicate'];
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    if (control.errors['pattern']) {
      if (controlName === 'username') return 'Only letters, numbers, and underscores allowed';
      if (controlName === 'password') return 'Use uppercase, lowercase, a number, and a special character';
    }

    return 'Invalid value';
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  private applyConflictErrors(message: string): void {
    const normalized = message.toLowerCase();

    if (normalized.includes('email')) {
      this.setServerError('email', 'This email is already used');
    }

    if (normalized.includes('username')) {
      this.setServerError('username', 'This username is already used');
    }

    if (normalized.includes('username or email')) {
      this.setServerError('email', 'This email may already be used');
      this.setServerError('username', 'This username may already be used');
    }
  }

  private setServerError(controlName: 'email' | 'username', message: string): void {
    const control = this.userForm.get(controlName);
    if (!control) {
      return;
    }

    control.setErrors({
      ...(control.errors ?? {}),
      serverDuplicate: message
    });
    control.markAsTouched();
  }

  private clearServerError(controlName: 'email' | 'username'): void {
    const control = this.userForm.get(controlName);
    if (!control?.errors?.['serverDuplicate']) {
      return;
    }

    const { serverDuplicate, ...remainingErrors } = control.errors;
    void serverDuplicate;

    control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
  }
}
