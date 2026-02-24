import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-caregiver-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './caregiver-dashboard.component.html',
  styleUrls: ['./caregiver-dashboard.component.scss']
})
export class CaregiverDashboardComponent {
  patients = [
    { name: 'Mary Johnson', status: 'Stable', condition: 'Diabetes' },
    { name: 'Robert Smith', status: 'Attention', condition: 'Hypertension' },
    { name: 'Linda Davis', status: 'Stable', condition: 'Arthritis' }
  ];

  todaySchedule = [
    { patientName: 'Mary Johnson', time: '9:00 AM', type: 'Medication Check' },
    { patientName: 'Robert Smith', time: '11:30 AM', type: 'Vital Signs' },
    { patientName: 'Linda Davis', time: '2:00 PM', type: 'Physical Therapy' }
  ];

  alerts = [
    { patient: 'Robert Smith', message: 'Blood pressure above normal range', severity: 'warn' },
    { patient: 'Mary Johnson', message: 'Missed morning medication', severity: 'warn' },
    { patient: 'Linda Davis', message: 'Appointment rescheduled', severity: 'primary' }
  ];

  tasks = [
    { title: 'Submit daily report', dueDate: 'Today, 5:00 PM' },
    { title: 'Order medical supplies', dueDate: 'Tomorrow' },
    { title: 'Update patient records', dueDate: 'Feb 25, 2026' }
  ];
}
