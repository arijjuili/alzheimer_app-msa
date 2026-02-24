import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Role } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data?.['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => 
      this.authService.hasRole(role)
    );

    if (hasRequiredRole) {
      return true;
    }

    // Redirect to unauthorized page
    return this.router.createUrlTree(['/unauthorized']);
  }
}
