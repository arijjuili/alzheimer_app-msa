import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

/**
 * Notifications Dialog Component
 * 
 * Displays a list of user notifications with the ability to mark all as read.
 * This is a standalone Angular component using Material Dialog.
 */
@Component({
  selector: 'app-notifications-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './notifications-dialog.component.html',
  styles: [`
    .notifications-dialog {
      min-width: 400px;
      max-width: 500px;
      max-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .notification-count {
      background-color: #f44336;
      color: white;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 14px;
      font-weight: 500;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 24px;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.unread {
        background-color: rgba(25, 118, 210, 0.08);

        &:hover {
          background-color: rgba(25, 118, 210, 0.12);
        }
      }
    }

    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.info {
        background-color: rgba(25, 118, 210, 0.12);
        color: #1976d2;
      }

      &.alert {
        background-color: rgba(244, 67, 54, 0.12);
        color: #f44336;
      }

      &.reminder {
        background-color: rgba(255, 152, 0, 0.12);
        color: #ff9800;
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 500;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notification-message {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.38);
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background-color: #1976d2;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.2);
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.38);
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;

      mat-icon {
        animation: spin 1s linear infinite;
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: rgba(0, 0, 0, 0.38);
      }

      p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.38);
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotificationsDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<NotificationsDialogComponent>);
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;

  NotificationType = NotificationType;

  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Load notifications from the service
   */
  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.updateUnreadCount();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications = [];
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => {
          notification.isRead = true;
        });
        this.updateUnreadCount();
      }
    });
  }

  /**
   * Close the dialog
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Get the icon name based on notification type
   */
  getIconForType(type: NotificationType): string {
    switch (type) {
      case NotificationType.INFO:
        return 'info';
      case NotificationType.ALERT:
        return 'warning';
      case NotificationType.REMINDER:
        return 'event';
      default:
        return 'notifications';
    }
  }

  /**
   * Get the CSS class for the notification icon based on type
   */
  getIconClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.INFO:
        return 'info';
      case NotificationType.ALERT:
        return 'alert';
      case NotificationType.REMINDER:
        return 'reminder';
      default:
        return 'info';
    }
  }

  /**
   * Format timestamp to relative time (e.g., "2 hours ago")
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Update the unread count in the service
   */
  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    this.notificationService.updateUnreadCount(this.unreadCount);
  }
}
