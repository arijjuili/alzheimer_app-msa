import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

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
    MatDividerModule
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent {
  upcomingAppointments = [
    { doctor: 'Dr. Sarah Johnson', date: 'Feb 25, 2026', time: '10:00 AM', type: 'Checkup' },
    { doctor: 'Dr. Michael Chen', date: 'Mar 2, 2026', time: '2:30 PM', type: 'Follow-up' }
  ];

  medications = [
    { name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', taken: true },
    { name: 'Metformin', dosage: '500mg', time: '12:00 PM', taken: false },
    { name: 'Atorvastatin', dosage: '20mg', time: '8:00 PM', taken: false }
  ];

  careTeam = [
    { name: 'Dr. Sarah Johnson', role: 'Primary Care Physician' },
    { name: 'Nurse Emily Davis', role: 'Registered Nurse' },
    { name: 'John Smith', role: 'Caregiver' }
  ];
}
