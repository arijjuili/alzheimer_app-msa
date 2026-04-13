import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-checkins-redirect',
  standalone: true,
  template: ''
})
export class CheckinsRedirectComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    if (roles.includes(Role.PATIENT)) {
      this.router.navigate(['/app/checkins/patient']);
    } else if (roles.includes(Role.CAREGIVER) || roles.includes(Role.DOCTOR) || roles.includes(Role.ADMIN)) {
      this.router.navigate(['/app/checkins/list']);
    } else {
      this.router.navigate(['/app/dashboard']);
    }
  }
}
