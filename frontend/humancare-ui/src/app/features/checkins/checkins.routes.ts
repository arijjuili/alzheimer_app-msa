import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';
import { Role } from '../../shared/models/user.model';
import { CheckinsRedirectComponent } from './components/checkins-redirect/checkins-redirect.component';
import { PatientCheckinsComponent } from './components/patient/patient-checkins.component';
import { CheckinsListComponent } from './components/checkins-list/checkins-list.component';

export const CHECKINS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CheckinsRedirectComponent },
      { path: 'patient', component: PatientCheckinsComponent, canActivate: [RoleGuard], data: { roles: [Role.PATIENT] } },
      { path: 'list', component: CheckinsListComponent, canActivate: [RoleGuard], data: { roles: [Role.CAREGIVER, Role.DOCTOR, Role.ADMIN] } }
    ]
  }
];
