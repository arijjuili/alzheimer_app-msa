import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';

export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/appointments-redirect/appointments-redirect.component')
      .then(m => m.AppointmentsRedirectComponent),
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN'] }
  },
  {
    path: 'patient',
    loadComponent: () => import('./components/patient/patient-appointments.component')
      .then(m => m.PatientAppointmentsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'ADMIN'] }
  },
  {
    path: 'caregiver',
    loadComponent: () => import('./components/caregiver/caregiver-appointments.component')
      .then(m => m.CaregiverAppointmentsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['CAREGIVER', 'ADMIN'] }
  },
  {
    path: 'doctor',
    loadComponent: () => import('./components/doctor/doctor-appointments.component')
      .then(m => m.DoctorAppointmentsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR', 'ADMIN'] }
  }
];
