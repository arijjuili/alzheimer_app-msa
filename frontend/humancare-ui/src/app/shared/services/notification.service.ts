import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    // Get notifications for current user
    return this.http.get<Notification[]>(`${this.apiUrl}/my`);
  }

  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`);
  }

  getMyNotifications(): Observable<Notification[]> {
    // Get notifications for current user - backend determines user from JWT token
    return this.http.get<Notification[]>(`${this.apiUrl}/my`);
  }

  getUnreadNotifications(): Observable<Notification[]> {
    // Get unread notifications for current user
    return this.http.get<Notification[]>(`${this.apiUrl}/my/unread`);
  }

  getUnreadCount(): Observable<number> {
    // Get unread count for current user - backend determines user from JWT token
    return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count))
    );
  }

  createNotification(notification: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  updateNotification(id: string, notification: UpdateNotificationRequest): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}`, notification);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  markAllAsRead(): Observable<void> {
    // Mark all as read for current user - backend determines user from JWT token
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private refreshUnreadCount(): void {
    // This will be called by components that have the recipientId
    // The unread count will be updated via the getUnreadCount method
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
