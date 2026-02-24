import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../../shared/models/user.model';

/**
 * Redirects users to their appropriate dashboard based on their primary role.
 * Priority: ADMIN > DOCTOR > CAREGIVER > PATIENT
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    
    if (!user || !user.roles || user.roles.length === 0) {
      // Default to patient dashboard if no roles
      return this.router.createUrlTree(['/app/dashboard/patient']);
    }

    // Determine primary role (highest priority)
    const roles = user.roles.map(r => r.toUpperCase());
    
    if (roles.includes(Role.ADMIN)) {
      return this.router.createUrlTree(['/app/dashboard/admin']);
    }
    
    if (roles.includes(Role.DOCTOR)) {
      return this.router.createUrlTree(['/app/dashboard/doctor']);
    }
    
    if (roles.includes(Role.CAREGIVER)) {
      return this.router.createUrlTree(['/app/dashboard/caregiver']);
    }
    
    // Default to patient dashboard
    return this.router.createUrlTree(['/app/dashboard/patient']);
  }
}
