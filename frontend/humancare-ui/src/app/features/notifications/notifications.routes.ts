import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/notifications-page/notifications-page.component')
      .then(m => m.NotificationsPageComponent),
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'DOCTOR', 'CAREGIVER', 'ADMIN'] }
  }
];
