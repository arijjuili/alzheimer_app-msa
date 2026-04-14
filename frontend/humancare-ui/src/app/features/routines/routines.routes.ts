import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';
import { Role } from '../../shared/models/user.model';
import { RoutinesRedirectComponent } from './components/routines-redirect/routines-redirect.component';
import { GamifiedRoutinesComponent } from './components/patient/gamified-routines/gamified-routines.component';
import { RoutinesListComponent } from './components/routines-list/routines-list.component';

export const ROUTINES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: RoutinesRedirectComponent },
      { path: 'patient', component: GamifiedRoutinesComponent, canActivate: [RoleGuard], data: { roles: [Role.PATIENT] } },
      { path: 'list', component: RoutinesListComponent, canActivate: [RoleGuard], data: { roles: [Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] } }
    ]
  }
];
