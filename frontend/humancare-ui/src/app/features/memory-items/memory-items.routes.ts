import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/auth/role.guard';
import { CaregiverMemoryItemsComponent } from './caregiver-memory-items.component';

export const MEMORY_ITEMS_ROUTES: Routes = [
  {
    path: '',
    component: CaregiverMemoryItemsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['CAREGIVER', 'ADMIN'] }
  }
];
