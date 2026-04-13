import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './core/components/app-shell/app-shell.component';
import { LoginComponent } from './features/login/login.component';
import { LogoutComponent } from './features/logout/logout.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';
import { SignupComponent } from './features/signup/signup.component';

export const routes: Routes = [
  // Public routes
  { 
    path: '', 
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'signup', 
    component: SignupComponent 
  },
  
  // Protected app routes with layout
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      { 
        path: 'profile', 
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      { 
        path: 'patients', 
        loadChildren: () => import('./features/patients/patients.routes').then(m => m.PATIENTS_ROUTES)
      },
      { 
        path: 'appointments', 
        loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES)
      },
      { 
        path: 'medications', 
        loadChildren: () => import('./features/medications/medications.routes').then(m => m.MEDICATIONS_ROUTES)
      },
      { 
        path: 'notifications', 
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      },
      { 
        path: 'checkins', 
        loadChildren: () => import('./features/checkins/checkins.routes').then(m => m.CHECKINS_ROUTES)
      },
      { 
        path: 'community', 
        loadChildren: () => import('./features/community/community.routes').then(m => m.COMMUNITY_ROUTES)
      },
      { 
        path: 'routines', 
        loadChildren: () => import('./features/routines/routines.routes').then(m => m.ROUTINES_ROUTES)
      },
      { 
        path: 'memories', 
        loadChildren: () => import('./features/memories/memories.routes').then(m => m.MEMORIES_ROUTES)
      }
    ]
  },
  
  // Logout
  { path: 'logout', component: LogoutComponent },
  
  // Unauthorized
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  // Fallback
  { path: '**', redirectTo: '' }
];
