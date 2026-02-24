import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';
import { DashboardRedirectGuard } from '../../core/auth/dashboard-redirect.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard-layout/dashboard-layout.component')
      .then(m => m.DashboardLayoutComponent),
    children: [
      { 
        path: '', 
        canActivate: [DashboardRedirectGuard],
        children: []  // Empty children, guard handles the redirect
      },
      { 
        path: 'patient', 
        loadComponent: () => import('./components/patient-dashboard/patient-dashboard.component')
          .then(m => m.PatientDashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] }
      },
      { 
        path: 'caregiver', 
        loadComponent: () => import('./components/caregiver-dashboard/caregiver-dashboard.component')
          .then(m => m.CaregiverDashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['CAREGIVER', 'ADMIN'] }
      },
      { 
        path: 'doctor', 
        loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component')
          .then(m => m.DoctorDashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] }
      },
      { 
        path: 'admin', 
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  }
];
