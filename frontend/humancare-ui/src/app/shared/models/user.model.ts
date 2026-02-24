export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export enum Role {
  PATIENT = 'PATIENT',
  CAREGIVER = 'CAREGIVER',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: Role[];
}
