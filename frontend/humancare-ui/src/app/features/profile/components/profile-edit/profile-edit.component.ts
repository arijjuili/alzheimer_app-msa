import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient, PatientUpdateRequest } from '../../../../shared/models/patient.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  patient: Patient | null = null;
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [null],
      address: [''],
      emergencyContact: [''],
      medicalHistory: ['']
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    // For demo, create mock patient data
    // In production, fetch actual patient data
    this.patient = {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-06-15',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Doe - +1 (555) 987-6543',
      medicalHistory: 'No significant medical history. Allergic to penicillin.'
    };

    this.profileForm.patchValue({
      firstName: this.patient.firstName,
      lastName: this.patient.lastName,
      email: this.patient.email,
      phone: this.patient.phone,
      dateOfBirth: this.patient.dateOfBirth ? new Date(this.patient.dateOfBirth) : null,
      address: this.patient.address,
      emergencyContact: this.patient.emergencyContact,
      medicalHistory: this.patient.medicalHistory
    });

    this.loading = false;
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.patient) {
      return;
    }

    this.saving = true;

    const updateData: PatientUpdateRequest = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone || undefined,
      dateOfBirth: this.profileForm.value.dateOfBirth ? this.formatDate(this.profileForm.value.dateOfBirth) : undefined,
      address: this.profileForm.value.address || undefined,
      emergencyContact: this.profileForm.value.emergencyContact || undefined,
      medicalHistory: this.profileForm.value.medicalHistory || undefined
    };

    this.patientService.updatePatient(this.patient.id, updateData)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(result => {
        if (result) {
          this.errorHandler.showSuccess('Profile updated successfully');
          this.router.navigate(['/profile/view']);
        }
      });
  }

  onCancel(): void {
    if (this.profileForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Discard Changes?',
          message: 'You have unsaved changes. Are you sure you want to discard them?',
          confirmButtonText: 'Discard',
          cancelButtonText: 'Keep Editing',
          confirmButtonColor: 'warn',
          icon: 'warning'
        } as ConfirmDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/profile/view']);
        }
      });
    } else {
      this.router.navigate(['/profile/view']);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
