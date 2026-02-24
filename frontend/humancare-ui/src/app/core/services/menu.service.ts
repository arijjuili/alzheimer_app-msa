import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem, Role, User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private allMenuItems: MenuItem[] = [
    // Common menu items - updated with /app prefix
    { icon: 'dashboard', label: 'Dashboard', route: '/app/dashboard', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] },
    
    // Patients menu item - accessible to DOCTOR, ADMIN, CAREGIVER
    { icon: 'people', label: 'Patients', route: '/app/patients', roles: [Role.DOCTOR, Role.ADMIN, Role.CAREGIVER] },
    
    // Appointments menu item - accessible to PATIENT, DOCTOR, ADMIN
    { icon: 'calendar_today', label: 'Appointments', route: '/app/appointments', roles: [Role.PATIENT, Role.DOCTOR, Role.ADMIN] },
    
    // Medications menu item - accessible to PATIENT, DOCTOR, CAREGIVER, ADMIN
    { icon: 'medication', label: 'Medications', route: '/app/medications', roles: [Role.PATIENT, Role.DOCTOR, Role.CAREGIVER, Role.ADMIN] },
    
    { icon: 'person', label: 'My Profile', route: '/app/profile', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] },
    
    // Patient menu items
    { icon: 'favorite', label: 'My Health', route: '/app/health', roles: [Role.PATIENT] },
    
    // Caregiver menu items
    { icon: 'people_outline', label: 'My Patients', route: '/app/my-patients', roles: [Role.CAREGIVER] },
    { icon: 'schedule', label: 'Schedule', route: '/app/schedule', roles: [Role.CAREGIVER] },
    
    // Doctor menu items
    { icon: 'groups', label: 'All Patients', route: '/app/all-patients', roles: [Role.DOCTOR] },
    { icon: 'medical_services', label: 'Medical Records', route: '/app/medical-records', roles: [Role.DOCTOR] },
    
    // Admin menu items
    { icon: 'manage_accounts', label: 'User Management', route: '/app/users', roles: [Role.ADMIN] },
    { icon: 'settings', label: 'System Settings', route: '/app/settings', roles: [Role.ADMIN] }
  ];

  constructor() {}

  getMenuItems(userRoles: Role[]): Observable<MenuItem[]> {
    const filteredItems = this.allMenuItems.filter(item => 
      item.roles.some(role => userRoles.includes(role))
    );
    return of(filteredItems);
  }

  getMenuItemsForUser(user: User | null): Observable<MenuItem[]> {
    if (!user || !user.roles) {
      return of([]);
    }
    return this.getMenuItems(user.roles);
  }

  getDashboardRouteForRole(roles: Role[]): string {
    const rolePriority: Role[] = [Role.ADMIN, Role.DOCTOR, Role.CAREGIVER, Role.PATIENT];
    
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return `/app/dashboard/${role.toLowerCase()}`;
      }
    }
    return '/app/dashboard/patient';
  }
}
