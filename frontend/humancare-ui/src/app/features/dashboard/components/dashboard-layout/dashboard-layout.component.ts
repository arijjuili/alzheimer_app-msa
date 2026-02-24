import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser$ = this.authService.getCurrentUser$();
  }

  ngOnInit(): void {
    // The actual dashboard content will be rendered by child routes
  }

  getWelcomeMessage(user: User): string {
    const hour = new Date().getHours();
    let greeting = 'Good day';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    const roleMessages: { [key: string]: string } = {
      'ADMIN': 'Manage your healthcare system efficiently.',
      'DOCTOR': 'Review your patients and upcoming appointments.',
      'CAREGIVER': 'Check on your assigned patients today.',
      'PATIENT': 'Track your health and manage appointments.'
    };
    
    const primaryRole = this.getPrimaryRole(user.roles);
    const message = roleMessages[primaryRole] || 'Here\'s what\'s happening today.';
    
    return `${greeting}! ${message}`;
  }

  private getPrimaryRole(roles: string[]): string {
    const priority = ['ADMIN', 'DOCTOR', 'CAREGIVER', 'PATIENT'];
    for (const role of priority) {
      if (roles.includes(role)) {
        return role;
      }
    }
    return 'PATIENT';
  }
}
