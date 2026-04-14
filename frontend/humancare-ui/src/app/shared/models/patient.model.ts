export interface Patient {
  id: string;
  keycloakId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  doctorId?: string;
  doctorName?: string;
  caregiverId?: string;
  caregiverName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface PatientUpdateRequest extends Partial<PatientCreateRequest> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientAudit {
  id: string;
  patientId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
}

export interface AssignmentRequest {
  patientId: string;
  doctorId?: string;
  caregiverId?: string;
}

export interface Caregiver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  enabled?: boolean;
}

export type UserRole = 'PATIENT' | 'CAREGIVER' | 'DOCTOR';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  specialty?: string;
  enabled?: boolean;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface UserRegistrationResponse {
  message: string;
  userId: string;
  patientId?: string | null;
  username: string;
  email: string;
  role: UserRole;
}
