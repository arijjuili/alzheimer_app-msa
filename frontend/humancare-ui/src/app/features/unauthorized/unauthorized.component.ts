import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <mat-icon class="error-icon">lock</mat-icon>
          <h1>403 - Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <p class="sub-message">
            If you believe this is an error, please contact your system administrator.
          </p>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/app/dashboard">
              <mat-icon>home</mat-icon>
              Go to Dashboard
            </button>
            <button mat-stroked-button routerLink="/logout">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .unauthorized-card {
      width: 100%;
      max-width: 500px;
      padding: 3rem;
      text-align: center;
    }
    
    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin-bottom: 1rem;
    }
    
    h1 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    
    p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    .sub-message {
      color: #999;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class UnauthorizedComponent {}
