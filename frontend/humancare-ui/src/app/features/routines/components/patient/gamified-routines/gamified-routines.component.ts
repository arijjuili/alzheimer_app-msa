import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { Routine, RoutineFrequency, Page } from '../../../../../shared/models/routine.model';
import { RoutineService } from '../../../services/routine.service';
import { PatientService } from '../../../../profile/services/patient.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

interface DailyRoutine extends Routine {
  checked: boolean;
  completionId?: string;
}

@Component({
  selector: 'app-gamified-routines',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './gamified-routines.component.html',
  styleUrls: ['./gamified-routines.component.scss']
})
export class GamifiedRoutinesComponent implements OnInit {
  routines: DailyRoutine[] = [];
  loading = false;
  currentPatientId: string | null = null;
  
  completedCount = 0;
  totalCount = 0;
  progressPercent = 0;
  streak = 0;
  today = new Date();
  
  greeting = '';
  motivationalMessage = '';

  private readonly motivationalMessages = [
    { threshold: 0, messages: ['Every journey starts with a single step! 🌟', 'You got this! 💪', 'Start your day strong! ☀️'] },
    { threshold: 25, messages: ['Great start! Keep going! 🚀', 'You\'re building great habits! ⭐', 'Look at you go! 🎉'] },
    { threshold: 50, messages: ['Halfway there! You\'re amazing! 🌈', 'Fantastic progress! 🎯', 'Keep up the awesome work! 💫'] },
    { threshold: 75, messages: ['Almost done! You\'re a champion! 🏆', 'So close to completing everything! 🌟', 'You\'re on fire! 🔥'] },
    { threshold: 100, messages: ['🎉 YOU DID IT! Amazing! 🎉', '🌟 Superstar! All tasks complete! 🌟', '🏆 Champion! You crushed it today! 🏆'] }
  ];

  constructor(
    private routineService: RoutineService,
    private patientService: PatientService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.patientService.resolveCurrentPatient().subscribe(patient => {
      this.currentPatientId = patient?.id || this.authService.getCurrentUser()?.id || null;
      this.loadRoutines();
    });
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 18) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  loadRoutines(): void {
    if (!this.currentPatientId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.routineService.getRoutinesByPatient(this.currentPatientId)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 } as Page<Routine>);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((page: Page<Routine>) => {
        const today = new Date().toISOString().split('T')[0];
        this.routines = page.content
          .filter(r => r.isActive)
          .map(r => ({
            ...r,
            checked: r.completed && r.lastCompletedDate === today
          })) as DailyRoutine[];
        this.calculateStats();
      });
  }

  private calculateStats(): void {
    this.totalCount = this.routines.length;
    this.completedCount = this.routines.filter(r => r.checked).length;
    this.progressPercent = this.totalCount > 0 ? (this.completedCount / this.totalCount) * 100 : 0;
    this.streak = this.calculateStreak();
    this.updateMotivationalMessage();
  }

  private calculateStreak(): number {
    if (this.routines.length === 0) {
      return 0;
    }
    // Use the minimum streak across all routines as the daily streak
    const streaks = this.routines.map(r => r.streak || 0);
    return Math.min(...streaks);
  }

  private updateMotivationalMessage(): void {
    for (const level of this.motivationalMessages) {
      if (this.progressPercent >= level.threshold) {
        const messages = level.messages;
        this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
      }
    }
  }

  toggleRoutine(routine: DailyRoutine): void {
    if (routine.checked) {
      this.uncheckRoutine(routine);
    } else {
      this.checkRoutine(routine);
    }
  }

  private checkRoutine(routine: DailyRoutine): void {
    if (!routine.id) return;

    this.routineService.completeRoutine(routine.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe((result: Routine | null) => {
        if (result) {
          routine.checked = true;
          this.showCelebration();
          this.calculateStats();
        }
      });
  }

  private uncheckRoutine(routine: DailyRoutine): void {
    if (!routine.id) return;
    
    this.routineService.uncompleteRoutine(routine.id)
      .pipe(
        catchError(err => {
          this.errorHandler.handleError(err);
          return of(null);
        })
      )
      .subscribe((result: Routine | null) => {
        if (result) {
          routine.checked = false;
          this.calculateStats();
        }
      });
  }

  private showCelebration(): void {
    if (this.progressPercent === 100) {
      this.snackBar.open('🎉 Amazing! You completed all your tasks for today!', 'Awesome!', {
        duration: 5000,
        panelClass: ['celebration-snackbar']
      });
    } else {
      this.snackBar.open('✅ Great job! Keep going!', 'Nice!', { duration: 2000 });
    }
  }

  getFrequencyLabel(frequency: RoutineFrequency): string {
    switch (frequency) {
      case RoutineFrequency.DAILY: return 'Every Day';
      case RoutineFrequency.WEEKLY: return 'Weekly';
      case RoutineFrequency.MONTHLY: return 'Monthly';
      default: return frequency;
    }
  }

  getFrequencyIcon(frequency: RoutineFrequency): string {
    switch (frequency) {
      case RoutineFrequency.DAILY: return 'today';
      case RoutineFrequency.WEEKLY: return 'date_range';
      case RoutineFrequency.MONTHLY: return 'calendar_month';
      default: return 'event';
    }
  }

  getTimeLabel(timeOfDay?: string): string {
    if (!timeOfDay) return '';
    const [hours, minutes] = timeOfDay.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes || '00'} ${ampm}`;
  }
}