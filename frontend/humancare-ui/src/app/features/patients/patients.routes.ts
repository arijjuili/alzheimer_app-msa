import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/patient-list/patient-list.component')
      .then(m => m.PatientListComponent),
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR', 'ADMIN', 'CAREGIVER'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/patient-detail/patient-detail.component')
      .then(m => m.PatientDetailComponent),
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR', 'ADMIN', 'CAREGIVER'] }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/patient-edit/patient-edit.component')
      .then(m => m.PatientEditComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'DOCTOR'] }
  }
];
