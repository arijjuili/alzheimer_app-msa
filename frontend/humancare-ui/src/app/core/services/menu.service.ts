import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem, Role, User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private allMenuItems: MenuItem[] = [
    // Common
    { icon: 'dashboard', label: 'Dashboard', route: '/app/dashboard', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] },
    
    // Patient
    { icon: 'favorite', label: 'My Health', route: '/app/checkins', roles: [Role.PATIENT] },
    { icon: 'medication', label: 'Medications', route: '/app/medications', roles: [Role.PATIENT] },
    { icon: 'event', label: 'Appointments', route: '/app/appointments', roles: [Role.PATIENT] },
    { icon: 'schedule', label: 'My Routines', route: '/app/routines', roles: [Role.PATIENT] },
    { icon: 'photo_library', label: 'Memories', route: '/app/memories', roles: [Role.PATIENT] },
    
    // Caregiver
    { icon: 'people', label: 'My Patients', route: '/app/patients', roles: [Role.CAREGIVER] },
    { icon: 'event', label: 'Appointments', route: '/app/appointments', roles: [Role.CAREGIVER] },
    { icon: 'schedule', label: 'Routines', route: '/app/routines', roles: [Role.CAREGIVER] },
    
    // Doctor
    { icon: 'people', label: 'Patients', route: '/app/patients', roles: [Role.DOCTOR] },
    { icon: 'medication', label: 'Medications', route: '/app/medications', roles: [Role.DOCTOR] },
    { icon: 'event', label: 'Appointments', route: '/app/appointments', roles: [Role.DOCTOR] },
    { icon: 'schedule', label: 'Routines', route: '/app/routines', roles: [Role.DOCTOR] },

    // Admin
    { icon: 'people', label: 'User Management', route: '/app/patients', roles: [Role.ADMIN] },
    
    // Common shared features
    { icon: 'forum', label: 'Community', route: '/app/community', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] },
    { icon: 'notifications', label: 'Notifications', route: '/app/notifications', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] },
    { icon: 'person', label: 'My Profile', route: '/app/profile', roles: [Role.PATIENT, Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] }
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
