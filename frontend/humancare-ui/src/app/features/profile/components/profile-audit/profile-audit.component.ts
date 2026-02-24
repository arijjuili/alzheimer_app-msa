import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { PatientService } from '../../services/patient.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PatientAudit } from '../../../../shared/models/patient.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-profile-audit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatPaginatorModule,
    DateFormatPipe
  ],
  templateUrl: './profile-audit.component.html',
  styleUrls: ['./profile-audit.component.scss']
})
export class ProfileAuditComponent implements OnInit {
  auditLogs: PatientAudit[] = [];
  loading = true;
  error: string | null = null;
  expandedLog: PatientAudit | null = null;

  // Pagination
  totalLogs = 0;
  pageSize = 10;
  pageIndex = 0;

  displayedColumns: string[] = ['action', 'changedBy', 'changedAt', 'expand'];

  constructor(
    private patientService: PatientService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    // For demo purposes, create mock audit logs
    // In production, fetch actual audit logs from the API
    this.auditLogs = this.getMockAuditLogs();
    this.totalLogs = this.auditLogs.length;
    this.loading = false;

    // Uncomment for actual API call:
    /*
    this.patientService.getPatientAudit(currentUser.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load audit logs';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(logs => {
        this.auditLogs = logs;
        this.totalLogs = logs.length;
      });
    */
  }

  toggleRow(log: PatientAudit): void {
    this.expandedLog = this.expandedLog === log ? null : log;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // In a real implementation, you would fetch the appropriate page from the API
  }

  getActionClass(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'create-chip';
      case 'UPDATE':
        return 'update-chip';
      case 'DELETE':
        return 'delete-chip';
      default:
        return '';
    }
  }

  private getMockAuditLogs(): PatientAudit[] {
    const currentUser = this.authService.getCurrentUser();
    return [
      {
        id: '1',
        patientId: currentUser?.id || 'user-1',
        action: 'UPDATE',
        oldValue: JSON.stringify({ phone: '+1 (555) 123-4560' }),
        newValue: JSON.stringify({ phone: '+1 (555) 123-4567' }),
        changedBy: 'John Doe',
        changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: '2',
        patientId: currentUser?.id || 'user-1',
        action: 'UPDATE',
        oldValue: JSON.stringify({ address: '123 Old St, City, State' }),
        newValue: JSON.stringify({ address: '123 Main St, City, State 12345' }),
        changedBy: 'Jane Smith',
        changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: '3',
        patientId: currentUser?.id || 'user-1',
        action: 'CREATE',
        oldValue: undefined,
        newValue: JSON.stringify({
          firstName: currentUser?.firstName || 'John',
          lastName: currentUser?.lastName || 'Doe',
          email: currentUser?.email || 'john@example.com'
        }),
        changedBy: 'System',
        changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      }
    ];
  }
}
