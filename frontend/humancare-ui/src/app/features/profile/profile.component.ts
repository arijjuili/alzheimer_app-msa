import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <button mat-icon-button routerLink="/app/dashboard">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>My Profile</span>
      <span class="spacer"></span>
    </mat-toolbar>

    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <div mat-card-avatar class="profile-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-card-title>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</mat-card-title>
          <mat-card-subtitle>{{ currentUser?.email }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>badge</mat-icon>
              <div matListItemTitle>User ID</div>
              <div matListItemLine>{{ currentUser?.id }}</div>
            </mat-list-item>
            
            <mat-list-item>
              <mat-icon matListItemIcon>email</mat-icon>
              <div matListItemTitle>Email</div>
              <div matListItemLine>{{ currentUser?.email }}</div>
            </mat-list-item>
            
            <mat-list-item>
              <mat-icon matListItemIcon>person</mat-icon>
              <div matListItemTitle>Full Name</div>
              <div matListItemLine>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
            </mat-list-item>
            
            <mat-list-item>
              <mat-icon matListItemIcon>security</mat-icon>
              <div matListItemTitle>Roles</div>
              <div matListItemLine>{{ currentUser?.roles?.join(', ') }}</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" routerLink="/app/dashboard">
            <mat-icon>dashboard</mat-icon>
            Back to Dashboard
          </button>
          <button mat-button color="warn" routerLink="/logout">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .profile-container {
      padding: 100px 2rem 2rem 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .profile-card {
      .profile-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #e3f2fd;
        
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #1976d2;
        }
      }
    }
    
    mat-card-actions {
      display: flex;
      gap: 1rem;
      padding: 1rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
