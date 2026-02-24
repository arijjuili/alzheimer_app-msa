import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    MatProgressBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  usersColumns: string[] = ['name', 'email', 'role', 'date'];
  
  recentUsers = [
    { name: 'John Smith', email: 'john.smith@email.com', role: 'Patient', registeredDate: 'Today' },
    { name: 'Dr. Emily Brown', email: 'emily.brown@clinic.com', role: 'Doctor', registeredDate: 'Yesterday' },
    { name: 'Michael Johnson', email: 'mjohnson@email.com', role: 'Caregiver', registeredDate: '2 days ago' },
    { name: 'Sarah Davis', email: 'sarah.davis@email.com', role: 'Patient', registeredDate: '3 days ago' }
  ];

  recentActivity = [
    { action: 'New user registered', user: 'System', time: '5 minutes ago', type: 'info', icon: 'person_add' },
    { action: 'Doctor approved patient record', user: 'Dr. Emily Brown', time: '15 minutes ago', type: 'info', icon: 'check_circle' },
    { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'info', icon: 'backup' },
    { action: 'High memory usage detected', user: 'System', time: '2 hours ago', type: 'warning', icon: 'warning' }
  ];

  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin': return 'warn';
      case 'Doctor': return 'primary';
      case 'Caregiver': return 'accent';
      case 'Patient': return 'default';
      default: return 'default';
    }
  }
}
