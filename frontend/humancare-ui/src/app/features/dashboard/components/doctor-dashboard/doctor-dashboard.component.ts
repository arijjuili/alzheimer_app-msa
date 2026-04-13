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
import { MatTooltipModule } from '@angular/material/tooltip';

import { PatientService } from '../../../profile/services/patient.service';
import { MedicationService } from '../../../medications/services/medication.service';
import { AppointmentService } from '../../../appointments/services/appointment.service';
import { CheckinService } from '../../../checkins/services/checkin.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient } from '../../../../shared/models/patient.model';
import { Appointment } from '../../../../shared/models/appointment.model';
import { IntakeStatus } from '../../../../shared/models/medication.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    MatDialogModule,
    MatTooltipModule
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

  todaysAppointments: Appointment[] = [];
  patientsWithoutCheckin: Patient[] = [];
  missedMedications: any[] = [];

  constructor(
    private patientService: PatientService,
    private medicationService: MedicationService,
    private appointmentService: AppointmentService,
    private checkinService: CheckinService,
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
    this.todaysAppointments = [];
    this.patientsWithoutCheckin = [];
    this.missedMedications = [];

    const currentUser = this.authService.getCurrentUser();
    this.currentDoctorId = currentUser?.id || null;

    if (!this.currentDoctorId) {
      this.loading = false;
      this.error = 'Could not identify current user';
      return;
    }

    this.loadingPatients = true;
    this.patientService.getPatientsByDoctor(this.currentDoctorId, 1, 10)
      .subscribe({
        next: (response) => {
          this.myPatients = response.data;
          this.myPatientsCount = response.total;
          this.loadingPatients = false;
          this.loadStats();
          this.loadTodaysAppointments();
          this.loadPendingCheckins();
          this.loadMedicationAlerts();
        },
        error: (err) => {
          this.loadingPatients = false;
          this.loading = false;
          this.error = 'Failed to load patient data';
        }
      });
  }

  private loadStats(): void {
    this.patientService.getPatients(1, 1).subscribe({
      next: (response) => {
        this.totalPatientsCount = response.total;
      }
    });

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

  private loadTodaysAppointments(): void {
    const today = new Date().toDateString();
    const patientIds = new Set(this.myPatients.map(p => p.id));
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.todaysAppointments = appointments
          .filter(a => patientIds.has(a.patientId) && new Date(a.appointmentDate).toDateString() === today)
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
      }
    });
  }

  private loadPendingCheckins(): void {
    const patientsToCheck = this.myPatients.slice(0, 10);
    this.patientsWithoutCheckin = [];
    patientsToCheck.forEach(patient => {
      this.checkinService.getTodaysCheckin(patient.id).pipe(
        catchError(err => {
          if (err.status === 404) {
            this.patientsWithoutCheckin.push(patient);
          }
          return of(null);
        })
      ).subscribe();
    });
  }

  private loadMedicationAlerts(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.missedMedications = [];
    this.myPatients.forEach(patient => {
      this.medicationService.getActivePlansByPatient(patient.id).subscribe({
        next: (plans) => {
          plans.forEach(plan => {
            if (!plan.id) {
              return;
            }
            this.medicationService.getIntakesByPlan(plan.id).subscribe({
              next: (intakes) => {
                intakes
                  .filter(i => i.status === IntakeStatus.MISSED && new Date(i.scheduledAt).getTime() >= cutoff)
                  .forEach(intake => {
                    this.missedMedications.push({
                      patientName: `${patient.firstName} ${patient.lastName}`,
                      medicationName: plan.medicationName,
                      scheduledAt: intake.scheduledAt
                    });
                  });
              }
            });
          });
        }
      });
    });
  }

  getPatientName(patientId: string): string {
    const patient = this.myPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  }

  bookAppointment(patient: Patient): void {
    this.router.navigate(['/appointments'], { queryParams: { patientId: patient.id } });
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
    event?.stopPropagation();
    this.router.navigate(['/medications', 'plans', 'new'], {
      queryParams: { patientId: patient.id }
    });
  }

  viewUnassigned(): void {
    this.router.navigate(['/patients'], {
      queryParams: { filter: 'unassigned' }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'primary';
      case 'In Progress': return 'accent';
      case 'Scheduled': return 'default';
      default: return 'default';
    }
  }
}
