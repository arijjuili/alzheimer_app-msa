import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';

export const MEDICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/medications-redirect/medications-redirect.component')
      .then(m => m.MedicationsRedirectComponent),
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'DOCTOR', 'CAREGIVER', 'ADMIN'] }
  },
  {
    path: 'patient',
    loadComponent: () => import('./components/patient/patient-medications.component')
      .then(m => m.PatientMedicationsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'ADMIN'] }
  },
  {
    path: 'doctor',
    loadComponent: () => import('./components/doctor/doctor-medications.component')
      .then(m => m.DoctorMedicationsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR', 'CAREGIVER', 'ADMIN'] }
  }
];
