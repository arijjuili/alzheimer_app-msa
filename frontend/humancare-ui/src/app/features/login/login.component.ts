import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakService } from '../../core/keycloak/keycloak.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private keycloakService: KeycloakService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if this is a relogin request (after forced logout)
    const isRelogin = this.route.snapshot.queryParamMap.get('relogin') === 'true';

    // If already authenticated and not a relogin request, redirect to dashboard
    if (this.authService.isAuthenticated() && !isRelogin) {
      window.location.href = '/app/dashboard';
      return;
    }

    // Wait for Keycloak to be initialized, then login
    const attemptLogin = () => {
      if (this.keycloakService.instance) {
        this.authService.login();
      } else {
        // Retry after a short delay if not initialized yet
        setTimeout(attemptLogin, 500);
      }
    };

    // Small delay to show the loading spinner before redirecting
    // Use shorter delay for relogin to make it snappier
    setTimeout(attemptLogin, isRelogin ? 100 : 1000);
  }
}
