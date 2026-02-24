import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-appointments-redirect',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="redirect-message">Redirecting...</div>',
  styles: [`
    .redirect-message {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #666;
      font-size: 1.2rem;
    }
  `]
})
export class AppointmentsRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.hasRole('DOCTOR')) {
      this.router.navigate(['/app/appointments/doctor']);
    } else if (this.authService.hasRole('PATIENT')) {
      this.router.navigate(['/app/appointments/patient']);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}
