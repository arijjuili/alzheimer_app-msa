import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';
import { PatientMemoryWalletComponent } from './patient-memory-wallet.component';

export const MEMORY_WALLET_ROUTES: Routes = [
  {
    path: '',
    component: PatientMemoryWalletComponent,
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT', 'CAREGIVER', 'ADMIN'] }
  }
];
