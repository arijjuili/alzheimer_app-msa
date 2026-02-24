export interface Patient {
  id: string;
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

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
}

export interface Caregiver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
