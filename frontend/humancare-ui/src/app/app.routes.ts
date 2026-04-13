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
        path: 'memory-items', 
        loadChildren: () => import('./features/memory-items/memory-items.routes').then(m => m.MEMORY_ITEMS_ROUTES)
      },
      { 
        path: 'memory-wallet', 
        loadChildren: () => import('./features/memory-wallet/memory-wallet.routes').then(m => m.MEMORY_WALLET_ROUTES)
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
