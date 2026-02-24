import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { KeycloakService } from '../keycloak/keycloak.service';
import { User, Role } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  login(redirectUri?: string): Promise<void> {
    return this.keycloakService.login(redirectUri);
  }

  logout(redirectUri?: string): Promise<void> {
    return this.keycloakService.logout(redirectUri);
  }

  isAuthenticated(): boolean {
    return this.keycloakService.isAuthenticated();
  }

  getCurrentUser(): User | null {
    const userInfo = this.keycloakService.getUserInfo();
    if (!userInfo) {
      return null;
    }

    const roles = this.keycloakService.getRoles();
    // Roles are already uppercase from keycloakService.getRoles()
    const mappedRoles = roles
      .map(role => Role[role as keyof typeof Role])
      .filter((role): role is Role => role !== undefined);

    return {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      roles: mappedRoles
    };
  }

  getCurrentUser$(): Observable<User | null> {
    return of(this.getCurrentUser());
  }

  hasRole(role: Role | string): boolean {
    const roleName = typeof role === 'string' ? role : String(role);
    return this.keycloakService.hasRole(roleName);
  }

  hasAnyRole(roles: (Role | string)[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasAllRoles(roles: (Role | string)[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  getToken(): string | undefined {
    return this.keycloakService.getToken();
  }

  refreshToken(): Observable<string | undefined> {
    return from(this.keycloakService.refreshToken()).pipe(
      catchError(() => of(undefined))
    );
  }

  getRoles(): Role[] {
    // Roles are already uppercase from keycloakService.getRoles()
    const roles = this.keycloakService.getRoles();
    return roles
      .map(role => Role[role as keyof typeof Role])
      .filter((role): role is Role => role !== undefined);
  }
}
