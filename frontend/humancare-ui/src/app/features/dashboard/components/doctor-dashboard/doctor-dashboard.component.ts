import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PatientService } from '../../../profile/services/patient.service';
import { MedicationService } from '../../../medications/services/medication.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  myPatients: Patient[] = [];
  myPatientsCount = 0;
  totalPatientsCount = 0;
  unassignedCount = 0;
  loading = true;
  loadingPatients = false;
  error: string | null = null;
  currentDoctorId: string | null = null;

  constructor(
    private patientService: PatientService,
    private medicationService: MedicationService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    // Load current doctor's ID
    const currentUser = this.authService.getCurrentUser();
    this.currentDoctorId = currentUser?.id || null;

    if (!this.currentDoctorId) {
      this.loading = false;
      this.error = 'Could not identify current user';
      return;
    }

    // Load my patients
    this.loadingPatients = true;
    this.patientService.getPatientsByDoctor(this.currentDoctorId, 1, 5)
      .subscribe({
        next: (response) => {
          this.myPatients = response.data;
          this.myPatientsCount = response.total;
          this.loadingPatients = false;
          this.loadStats();
        },
        error: (err) => {
          this.loadingPatients = false;
          this.loading = false;
          this.error = 'Failed to load patient data';
        }
      });
  }

  private loadStats(): void {
    // Load total patients count
    this.patientService.getPatients(1, 1).subscribe({
      next: (response) => {
        this.totalPatientsCount = response.total;
      }
    });

    // Load unassigned count
    this.patientService.getUnassignedPatients(1, 1).subscribe({
      next: (response) => {
        this.unassignedCount = response.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewAllPatients(): void {
    this.router.navigate(['/patients']);
  }

  viewMyPatients(): void {
    this.router.navigate(['/patients'], { 
      queryParams: { filter: 'my-patients' } 
    });
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }

  addMedication(patient: Patient, event?: Event): void {
    // Prevent row click from triggering
    event?.stopPropagation();
    
    // Navigate to medication create with patient pre-selected
    this.router.navigate(['/medications', 'plans', 'new'], {
      queryParams: { patientId: patient.id }
    });
  }

  viewUnassigned(): void {
    this.router.navigate(['/patients'], { 
      queryParams: { filter: 'unassigned' } 
    });
  }

  // Keep for backward compatibility with existing template
  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'In Progress': return 'accent';
      case 'Scheduled': return 'default';
      default: return 'default';
    }
  }
}
