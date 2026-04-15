import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Notification, NotificationType } from '../../../../shared/models/notification.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Role } from '../../../../shared/models/user.model';
import { environment } from '../../../../../environments/environment';

type FilterType = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  loading = true;
  error: string | null = null;
  recipientId: string | null = null;
  unreadCount = 0;
  currentFilter: FilterType = 'all';
  
  private unreadCountSubscription: Subscription | null = null;
  private http = inject(HttpClient);
  canTriggerReminders = false;
  triggering = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {
    const roles = this.authService.getRoles();
    this.canTriggerReminders = roles.includes(Role.ADMIN) || roles.includes(Role.DOCTOR);
  }

  ngOnInit(): void {
    this.recipientId = this.getRecipientIdFromToken();
    this.loadNotifications();
    
    // Subscribe to unread count updates
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      count => this.unreadCount = count
    );
  }

  ngOnDestroy(): void {
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  getRecipientIdFromToken(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.id || null;
  }

  loadNotifications(): void {
    if (!this.recipientId) {
      this.error = 'User ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.notificationService.getMyNotifications()
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          this.error = 'Failed to load notifications';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilter(this.currentFilter);
        this.updateUnreadCount();
      });
  }

  updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.isRead).length;
    this.unreadCount = count;
    this.notificationService.updateUnreadCount(count);
  }

  applyFilter(filter: FilterType): void {
    this.currentFilter = filter;
    
    switch (filter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.isRead);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter(n => n.isRead);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          notification.isRead = true;
          notification.updatedAt = new Date().toISOString();
          this.applyFilter(this.currentFilter);
          this.updateUnreadCount();
        }
      });
  }

  markAllAsRead(): void {
    if (!this.recipientId || this.unreadCount === 0) return;

    this.notificationService.markAllAsRead()
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe(() => {
        this.notifications.forEach(n => n.isRead = true);
        this.applyFilter(this.currentFilter);
        this.updateUnreadCount();
      });
  }

  deleteNotification(notification: Notification): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Notification',
        message: 'Are you sure you want to delete this notification? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn',
        icon: 'delete_forever'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.deleteNotification(notification.id)
          .pipe(
            catchError(err => {
              this.errorHandler.handleError(err);
              return of(null);
            })
          )
          .subscribe(result => {
            if (result !== null) {
              this.notifications = this.notifications.filter(n => n.id !== notification.id);
              this.applyFilter(this.currentFilter);
              this.updateUnreadCount();
            }
          });
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.ALERT:
        return 'warning';
      case NotificationType.REMINDER:
        return 'alarm';
      case NotificationType.INFO:
      default:
        return 'info';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.ALERT:
        return 'warn';
      case NotificationType.REMINDER:
        return 'accent';
      case NotificationType.INFO:
      default:
        return 'primary';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  triggerAppointmentReminders(): void {
    this.triggering = true;
    this.http.post(`${environment.apiUrl}/api/notifications/test/trigger-appointment-reminders`, {})
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        }),
        finalize(() => this.triggering = false)
      )
      .subscribe(result => {
        if (result !== null) {
          this.loadNotifications();
        }
      });
  }

  private getMockNotifications(): Notification[] {
    const now = new Date();
    return [
      {
        id: '550e8400-e29b-41d4-a716-446655440100',
        recipientId: this.recipientId || '550e8400-e29b-41d4-a716-446655440000',
        title: 'Appointment Reminder',
        message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.',
        type: NotificationType.REMINDER,
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        recipientId: this.recipientId || '550e8400-e29b-41d4-a716-446655440000',
        title: 'Medication Alert',
        message: 'Time to take your blood pressure medication.',
        type: NotificationType.ALERT,
        isRead: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        recipientId: this.recipientId || '550e8400-e29b-41d4-a716-446655440000',
        title: 'Lab Results Available',
        message: 'Your recent lab results are now available for viewing.',
        type: NotificationType.INFO,
        isRead: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        recipientId: this.recipientId || '550e8400-e29b-41d4-a716-446655440000',
        title: 'Prescription Refill',
        message: 'Your prescription for Metformin has been refilled.',
        type: NotificationType.INFO,
        isRead: true,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        recipientId: this.recipientId || '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Caregiver Assigned',
        message: 'Jane Smith has been assigned as your caregiver.',
        type: NotificationType.INFO,
        isRead: true,
        createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}
