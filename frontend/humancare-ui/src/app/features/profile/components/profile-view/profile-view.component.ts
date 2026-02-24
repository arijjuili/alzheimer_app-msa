import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    DateFormatPipe,
    InitialsPipe
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  patient: Patient | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
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

    // For demo purposes, we'll create a patient from user data
    // In production, you would fetch the patient by user ID
    this.patientService.getPatients(1, 10)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load patient data';
          return of({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        // For demo, create a patient from user data
        // In production, fetch the actual patient by ID
        if (response.data.length > 0) {
          this.patient = response.data[0];
        } else {
          // Mock patient data for demo
          this.patient = {
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: '+1 (555) 123-4567',
            dateOfBirth: '1985-06-15',
            address: '123 Main St, City, State 12345',
            emergencyContact: 'Jane Doe - +1 (555) 987-6543',
            medicalHistory: 'No significant medical history. Allergic to penicillin.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      });
  }
}
