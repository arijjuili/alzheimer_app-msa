import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { NotificationType, CreateNotificationRequest } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationTriggerService {
  constructor(private notificationService: NotificationService) {}

  /**
   * Notify a single recipient silently (errors swallowed)
   */
  notify(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO
  ): Observable<void> {
    const request: CreateNotificationRequest = {
      recipientId,
      title,
      message,
      type
    };
    return this.notificationService.createNotification(request).pipe(
      catchError(() => of(undefined as any))
    ) as Observable<void>;
  }

  /**
   * Notify multiple recipients silently
   */
  notifyMany(
    recipients: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO
  ): void {
    recipients.forEach(recipientId => {
      this.notify(recipientId, title, message, type).subscribe();
    });
  }

  /** Doctor prescribed medication */
  medicationPrescribed(patientId: string, medicationName: string, doctorName: string): void {
    this.notify(
      patientId,
      'New Prescription',
      `Dr. ${doctorName} prescribed ${medicationName}.`,
      NotificationType.INFO
    ).subscribe();
  }

  /** New appointment scheduled */
  appointmentScheduled(recipients: string[], patientName: string, schedulerName: string): void {
    this.notifyMany(
      recipients,
      'Appointment Scheduled',
      `${schedulerName} scheduled an appointment for ${patientName}.`,
      NotificationType.REMINDER
    );
  }

  /** Patient submitted a check-in */
  checkinSubmitted(recipients: string[], patientName: string): void {
    this.notifyMany(
      recipients,
      'Daily Check-in Submitted',
      `${patientName} submitted today's check-in.`,
      NotificationType.ALERT
    );
  }

  /** Caregiver shared a memory */
  memoryShared(patientId: string, caregiverName: string): void {
    this.notify(
      patientId,
      'New Memory Shared',
      `${caregiverName} shared a new memory with you.`,
      NotificationType.INFO
    ).subscribe();
  }
}
