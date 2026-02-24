import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../shared/models/user.model';
import { Notification } from '../../../shared/models/notification.model';
import { AuthService } from '../../../core/auth/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    NotificationsDialogComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  unreadCount$: Observable<number> = of(0);
  notifications$: Observable<Notification[]> = of([]);

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.authService.getCurrentUser$();
  }

  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  openNotifications(): void {
    this.dialog.open(NotificationsDialogComponent, {
      width: '400px',
      maxHeight: '600px'
    });
  }

  toggleSidebar(): void {
    this.navigationService.toggleSidebar();
  }

  getInitials(user: User): string {
    if (!user) return '';
    const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  getRolesDisplay(user: User): string {
    if (!user || !user.roles) return '';
    return user.roles.map(role => role.toLowerCase()).join(', ');
  }

  logout(): void {
    // Navigate to logout route which handles the full logout flow
    // This ensures proper cleanup and shows the "Logging out..." message
    window.location.href = '/logout';
  }
}
