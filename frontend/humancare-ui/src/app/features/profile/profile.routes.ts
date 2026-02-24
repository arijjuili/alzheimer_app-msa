import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/profile-layout/profile-layout.component')
      .then(m => m.ProfileLayoutComponent),
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { 
        path: 'view', 
        loadComponent: () => import('./components/profile-view/profile-view.component')
          .then(m => m.ProfileViewComponent)
      },
      { 
        path: 'edit', 
        loadComponent: () => import('./components/profile-edit/profile-edit.component')
          .then(m => m.ProfileEditComponent)
      },
      { 
        path: 'audit', 
        loadComponent: () => import('./components/profile-audit/profile-audit.component')
          .then(m => m.ProfileAuditComponent),
        canActivate: [RoleGuard],
        data: { roles: ['DOCTOR', 'ADMIN', 'CAREGIVER'] }
      }
    ]
  }
];
