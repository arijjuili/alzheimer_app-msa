import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PatientService } from '../../../profile/services/patient.service';
import { AppointmentService } from '../../../appointments/services/appointment.service';
import { Patient } from '../../../../shared/models/patient.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  usersColumns: string[] = ['name', 'email', 'role', 'date'];

  totalPatients = 0;
  totalDoctors = 0;
  totalCaregivers = 0;
  todayAppointments = 0;
  loading = false;
  recentUsers: Patient[] = [];

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    const today = new Date().toDateString();

    forkJoin({
      allPatients: this.patientService.getPatients(1, 1).pipe(catchError(() => of({ total: 0, data: [] }))),
      recent: this.patientService.getPatients(1, 10).pipe(catchError(() => of({ total: 0, data: [] }))),
      doctors: this.patientService.getAvailableDoctors().pipe(catchError(() => of([]))),
      caregivers: this.patientService.getAvailableCaregivers().pipe(catchError(() => of([]))),
      appointments: this.appointmentService.getAllAppointments().pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        this.totalPatients = (results.allPatients as any).total ?? 0;
        this.recentUsers = ((results.recent as any).data || []).slice(0, 5);
        this.totalDoctors = (results.doctors || []).length;
        this.totalCaregivers = (results.caregivers || []).length;
        this.todayAppointments = (results.appointments || []).filter(
          a => new Date(a.appointmentDate).toDateString() === today
        ).length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'warn';
      case 'DOCTOR': return 'primary';
      case 'CAREGIVER': return 'accent';
      case 'PATIENT': return 'default';
      default: return 'default';
    }
  }
}
