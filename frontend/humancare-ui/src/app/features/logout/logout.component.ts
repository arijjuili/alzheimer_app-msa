import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="logout-container">
      <mat-card>
        <mat-card-content>
          <div class="logout-content">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Logging out...</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    }
    .logout-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }
  `]
})
export class LogoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if we're returning from Keycloak logout (no auth) or starting logout
    if (this.authService.isAuthenticated()) {
      // User is still authenticated, initiate logout flow
      // This will redirect to Keycloak logout, then back to this page
      this.authService.logout();
    } else {
      // User is already logged out (redirected back from Keycloak)
      // Redirect to landing page after a brief delay to show the message
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    }
  }
}
