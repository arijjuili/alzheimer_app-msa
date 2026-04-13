import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../../../../core/auth/auth.service';
import { CheckinService } from '../../../checkins/services/checkin.service';
import { AppointmentService } from '../../../appointments/services/appointment.service';
import { MedicationService } from '../../../medications/services/medication.service';
import { RoutineService } from '../../../routines/services/routine.service';
import { MemoryService } from '../../../memories/services/memory.service';
import { PatientService } from '../../../profile/services/patient.service';
import { CheckinCreateDialogComponent } from '../../../checkins/components/patient/dialogs/checkin-create-dialog.component';

import { DailyCheckin } from '../../../../shared/models/checkin.model';
import { Appointment, AppointmentStatus } from '../../../../shared/models/appointment.model';
import { MedicationPlan, MedicationIntake, IntakeStatus } from '../../../../shared/models/medication.model';
import { Routine } from '../../../../shared/models/routine.model';
import { MemoryItem } from '../../../../shared/models/memory.model';
import { Patient } from '../../../../shared/models/patient.model';

interface TodayMedicationView {
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  intakeId: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  currentPatientId: string | null = null;

  todaysCheckin: DailyCheckin | null = null;
  upcomingAppointments: Appointment[] = [];
  todaysMedications: TodayMedicationView[] = [];
  activeRoutines: Routine[] = [];
  recentMemories: MemoryItem[] = [];
  patientRecord: Patient | null = null;

  constructor(
    private authService: AuthService,
    private checkinService: CheckinService,
    private appointmentService: AppointmentService,
    private medicationService: MedicationService,
    private routineService: RoutineService,
    private memoryService: MemoryService,
    private patientService: PatientService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.loading = false;
      this.error = 'Could not identify current user';
      return;
    }
    this.currentPatientId = currentUser.id;
    this.loadDashboard();
  }

  loadDashboard(): void {
    if (!this.currentPatientId) {
      return;
    }
    this.loading = true;
    this.error = null;

    // a. Today's check-in (graceful 404)
    const todaysCheckin$ = this.checkinService.getTodaysCheckin(this.currentPatientId).pipe(
      catchError(err => {
        if (err.status === 404) {
          return of(null);
        }
        throw err;
      })
    );

    // b. Appointments
    const appointments$ = this.appointmentService.getAppointmentsByPatient(this.currentPatientId).pipe(
      catchError(() => of([]))
    );

    // c. Medications: active plans -> intakes per plan
    const medications$ = this.medicationService.getActivePlansByPatient(this.currentPatientId).pipe(
      catchError(() => of([] as MedicationPlan[]))
    );

    // d. Routines
    const routines$ = this.routineService.getRoutinesByPatient(this.currentPatientId, 0, 20).pipe(
      catchError(() => of([] as Routine[]))
    );

    // e. Memories
    const memories$ = this.memoryService.getMemoriesByPatient(this.currentPatientId, 0, 3).pipe(
      catchError(() => of([] as MemoryItem[]))
    );

    // f. Patient record
    const patient$ = this.patientService.getPatientById(this.currentPatientId).pipe(
      catchError(() => of(null))
    );

    forkJoin({
      checkin: todaysCheckin$,
      appointments: appointments$,
      plans: medications$,
      routines: routines$,
      memories: memories$,
      patient: patient$
    }).subscribe({
      next: (results) => {
        this.todaysCheckin = results.checkin;

        // Filter appointments: next 7 days, SCHEDULED, top 3
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);
        this.upcomingAppointments = (results.appointments || [])
          .filter(a => a.status === AppointmentStatus.SCHEDULED)
          .filter(a => {
            const d = new Date(a.appointmentDate);
            return d >= now && d <= sevenDaysLater;
          })
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .slice(0, 3);

        this.activeRoutines = (results.routines || []).filter(r => r.isActive).slice(0, 3);
        this.recentMemories = (results.memories || []).slice(0, 3);
        this.patientRecord = results.patient;

        // Process medications intakes
        this.processMedications(results.plans as MedicationPlan[]);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load dashboard data. Please try again.';
      }
    });
  }

  private processMedications(plans: MedicationPlan[]): void {
    if (!plans || plans.length === 0) {
      this.todaysMedications = [];
      this.loading = false;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const intakeRequests = plans
      .filter(p => p.id)
      .map(plan =>
        this.medicationService.getIntakesByPlan(plan.id!).pipe(
          catchError(() => of([] as MedicationIntake[])),
          map(intakes => ({ plan, intakes: intakes || [] }))
        )
      );

    forkJoin(intakeRequests).subscribe({
      next: (results) => {
        const meds: TodayMedicationView[] = [];
        results.forEach(({ plan, intakes }) => {
          const todaysIntakes = intakes.filter(i => {
            const scheduledDate = i.scheduledAt ? i.scheduledAt.split('T')[0] : null;
            return scheduledDate === todayStr;
          });
          todaysIntakes.forEach(i => {
            meds.push({
              name: plan.medicationName,
              dosage: plan.dosage,
              time: i.scheduledAt,
              taken: i.status === IntakeStatus.TAKEN,
              intakeId: i.id || ''
            });
          });
        });
        // Sort by time
        meds.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        this.todaysMedications = meds;
        this.loading = false;
      },
      error: () => {
        this.todaysMedications = [];
        this.loading = false;
      }
    });
  }

  checkInToday(): void {
    if (!this.currentPatientId) {
      return;
    }
    const dialogRef = this.dialog.open(CheckinCreateDialogComponent, {
      width: '500px',
      data: { patientId: this.currentPatientId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboard();
      }
    });
  }

  viewAllAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  viewMedications(): void {
    this.router.navigate(['/medications']);
  }

  viewRoutines(): void {
    this.router.navigate(['/routines']);
  }

  viewMemories(): void {
    this.router.navigate(['/memories']);
  }

  markMedicationTaken(intakeId: string): void {
    if (!intakeId) {
      return;
    }
    this.medicationService.markAsTaken(intakeId).subscribe({
      next: () => this.loadDashboard(),
      error: () => {}
    });
  }

  markMedicationMissed(intakeId: string): void {
    if (!intakeId) {
      return;
    }
    this.medicationService.markAsMissed(intakeId).subscribe({
      next: () => this.loadDashboard(),
      error: () => {}
    });
  }

  getMemoryIcon(type: string): string {
    switch (type) {
      case 'PHOTO': return 'photo';
      case 'VIDEO': return 'videocam';
      case 'AUDIO': return 'audiotrack';
      case 'NOTE': return 'note';
      default: return 'memory';
    }
  }

  formatAppointmentDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatAppointmentTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  formatMedicationTime(dateTimeStr: string): string {
    const d = new Date(dateTimeStr);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
}
