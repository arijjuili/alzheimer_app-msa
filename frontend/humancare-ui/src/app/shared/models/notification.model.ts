/**
 * Notification type enum matching Java backend
 */
export enum NotificationType {
  INFO = 'INFO',
  ALERT = 'ALERT',
  REMINDER = 'REMINDER'
}

/**
 * Notification interface matching Java backend Notification entity
 */
export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * NotificationResponse interface for API responses
 * Wraps the notification data with optional metadata
 */
export interface NotificationResponse {
  data: Notification;
  message?: string;
  timestamp?: string;
}

/**
 * NotificationsListResponse interface for paginated API responses
 */
export interface NotificationsListResponse {
  data: Notification[];
  total: number;
  page: number;
  size: number;
  message?: string;
  timestamp?: string;
}

/**
 * CreateNotificationRequest interface for creating new notifications
 */
export interface CreateNotificationRequest {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
}

/**
 * UpdateNotificationRequest interface for updating notifications
 * (e.g., marking as read)
 */
export interface UpdateNotificationRequest {
  isRead?: boolean;
  title?: string;
  message?: string;
  type?: NotificationType;
}
