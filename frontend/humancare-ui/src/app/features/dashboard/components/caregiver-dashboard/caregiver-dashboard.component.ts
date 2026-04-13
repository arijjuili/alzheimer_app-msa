import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap, map } from 'rxjs/operators';

import { PatientService } from '../../../profile/services/patient.service';
import { RoutineService } from '../../../routines/services/routine.service';
import { AppointmentService } from '../../../appointments/services/appointment.service';
import { MedicationService } from '../../../medications/services/medication.service';
import { CheckinService } from '../../../checkins/services/checkin.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Patient, PaginatedResponse } from '../../../../shared/models/patient.model';
import { Routine } from '../../../../shared/models/routine.model';
import { Appointment } from '../../../../shared/models/appointment.model';
import { MedicationPlan, MedicationIntake } from '../../../../shared/models/medication.model';
import { DailyCheckin } from '../../../../shared/models/checkin.model';

@Component({
  selector: 'app-caregiver-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './caregiver-dashboard.component.html',
  styleUrls: ['./caregiver-dashboard.component.scss']
})
export class CaregiverDashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  currentCaregiverId: string | null = null;

  assignedPatients: Patient[] = [];
  todaySchedule: any[] = [];
  alerts: any[] = [];
  routinesToComplete: any[] = [];

  constructor(
    private patientService: PatientService,
    private routineService: RoutineService,
    private appointmentService: AppointmentService,
    private medicationService: MedicationService,
    private checkinService: CheckinService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    this.currentCaregiverId = currentUser?.id || null;

    if (!this.currentCaregiverId) {
      this.loading = false;
      this.error = 'Could not identify current user';
      return;
    }

    this.patientService.getPatients(1, 100).pipe(
      catchError(err => {
        this.error = 'Failed to load patients';
        return of({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 } as PaginatedResponse<Patient>);
      }),
      switchMap(response => {
        this.assignedPatients = (response.data || []).filter(
          p => p.caregiverId === this.currentCaregiverId
        );

        if (this.assignedPatients.length === 0) {
          return of({
            routines: [] as Routine[],
            appointments: [] as Appointment[],
            plans: [] as MedicationPlan[],
            intakes: [] as MedicationIntake[]
          });
        }

        return forkJoin({
          routines: this.routineService.getAllRoutines(0, 1000).pipe(catchError(() => of([] as Routine[]))),
          appointments: this.appointmentService.getAllAppointments().pipe(catchError(() => of([] as Appointment[]))),
          plans: this.medicationService.getAllPlans().pipe(catchError(() => of([] as MedicationPlan[]))),
          intakes: this.medicationService.getAllIntakes().pipe(catchError(() => of([] as MedicationIntake[])))
        });
      }),
      switchMap(({ routines, appointments, plans, intakes }) => {
        this.buildScheduleAndTasks(routines, appointments, plans, intakes);

        const checkinRequests = this.assignedPatients.map(p =>
          this.checkinService.getTodaysCheckin(p.id).pipe(catchError(() => of(null)))
        );

        return forkJoin(checkinRequests).pipe(
          map(checkins => ({ checkins, plans, intakes }))
        );
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ checkins, plans, intakes }) => {
        this.buildAlerts(checkins, plans, intakes);
      },
      error: err => {
        this.error = this.error || 'Failed to load dashboard data';
      }
    });
  }

  private buildScheduleAndTasks(
    routines: Routine[],
    appointments: Appointment[],
    plans: MedicationPlan[],
    intakes: MedicationIntake[]
  ): void {
    const patientIds = this.assignedPatients.map(p => p.id);
    const patientNameMap = new Map(this.assignedPatients.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const today = new Date().toISOString().split('T')[0];

    const assignedRoutines = (routines || []).filter(r => patientIds.includes(r.patientId) && r.isActive);
    const todayRoutines = assignedRoutines.filter(r => r.timeOfDay);

    const todayAppointments = (appointments || []).filter(
      a => patientIds.includes(a.patientId) && a.appointmentDate && a.appointmentDate.startsWith(today)
    );

    const assignedPlans = (plans || []).filter(p => patientIds.includes(p.patientId) && p.active !== false);
    const planIdToPatientId = new Map(assignedPlans.map(p => [p.id, p.patientId]));

    const todayIntakes = (intakes || []).filter(
      i => i.scheduledAt && i.scheduledAt.startsWith(today) && planIdToPatientId.has(i.planId)
    );

    const schedule: any[] = [];

    todayRoutines.forEach(r => {
      schedule.push({
        time: r.timeOfDay!.substring(0, 5),
        patientName: patientNameMap.get(r.patientId) || 'Unknown',
        type: 'Routine',
        title: r.title
      });
    });

    todayAppointments.forEach(a => {
      schedule.push({
        time: a.appointmentDate.substring(11, 16),
        patientName: patientNameMap.get(a.patientId) || 'Unknown',
        type: 'Appointment',
        title: a.reason
      });
    });

    todayIntakes.forEach(i => {
      const pid = planIdToPatientId.get(i.planId);
      if (pid) {
        schedule.push({
          time: i.scheduledAt.substring(11, 16),
          patientName: patientNameMap.get(pid) || 'Unknown',
          type: 'Medication',
          title: 'Medication intake'
        });
      }
    });

    schedule.sort((a, b) => a.time.localeCompare(b.time));
    this.todaySchedule = schedule;

    this.routinesToComplete = todayRoutines.map(r => ({
      title: r.title,
      patientName: patientNameMap.get(r.patientId) || 'Unknown',
      time: r.timeOfDay!.substring(0, 5)
    }));
  }

  private buildAlerts(
    checkins: (DailyCheckin | null)[],
    plans: MedicationPlan[],
    intakes: MedicationIntake[]
  ): void {
    const patientIds = this.assignedPatients.map(p => p.id);
    const patientNameMap = new Map(this.assignedPatients.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const today = new Date().toISOString().split('T')[0];

    const alerts: any[] = [];

    this.assignedPatients.forEach((p, idx) => {
      if (!checkins[idx]) {
        alerts.push({
          patientName: patientNameMap.get(p.id) || 'Unknown',
          message: 'No check-in today',
          severity: 'warn'
        });
      }
    });

    const assignedPlans = (plans || []).filter(p => patientIds.includes(p.patientId) && p.active !== false);
    const planIdToPatientId = new Map(assignedPlans.map(p => [p.id, p.patientId]));

    const missedIntakes = (intakes || []).filter(
      i => i.status === 'MISSED' && i.scheduledAt && i.scheduledAt.startsWith(today)
    );

    missedIntakes.forEach(i => {
      const pid = planIdToPatientId.get(i.planId);
      if (pid && patientIds.includes(pid)) {
        alerts.push({
          patientName: patientNameMap.get(pid) || 'Unknown',
          message: 'Missed medication intake',
          severity: 'warn'
        });
      }
    });

    this.alerts = alerts.slice(0, 5);
  }

  getPatientStatus(patient: Patient): string {
    const name = `${patient.firstName} ${patient.lastName}`;
    const hasWarn = this.alerts.some(a => a.patientName === name && a.severity === 'warn');
    return hasWarn ? 'Attention' : 'Stable';
  }

  viewPatients(): void {
    this.router.navigate(['/patients']);
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }
}
