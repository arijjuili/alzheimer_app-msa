export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;  // UUID
  patientId: string;  // UUID from Keycloak/patient service
  doctorName: string;
  appointmentDate: string; // ISO format: "2024-06-15T10:30:00"
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface AppointmentCreateRequest {
  patientId: string;  // UUID from Keycloak/patient service
  doctorName: string;
  appointmentDate: string; // ISO format: "2024-06-15T10:30:00"
  reason: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentUpdateRequest extends Partial<AppointmentCreateRequest> {}
