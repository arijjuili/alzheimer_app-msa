// MedicationForm enum
export enum MedicationForm {
  TABLET = 'TABLET',
  SYRUP = 'SYRUP',
  INJECTION = 'INJECTION',
  DROPS = 'DROPS',
  OTHER = 'OTHER'
}

// IntakeStatus enum
export enum IntakeStatus {
  SCHEDULED = 'SCHEDULED',
  TAKEN = 'TAKEN',
  MISSED = 'MISSED',
  SKIPPED = 'SKIPPED'
}

// MedicationPlan interface
export interface MedicationPlan {
  id?: string;  // UUID
  patientId: string;  // UUID
  patientName?: string; // Display name (frontend-only)
  medicationName: string;
  dosage: string;
  form: MedicationForm;
  frequencyPerDay: number;
  startDate: string;  // ISO date: "2024-06-15"
  endDate?: string;   // ISO date: "2024-07-15"
  instructions?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// MedicationIntake interface
export interface MedicationIntake {
  id?: string;  // UUID
  planId?: string;  // UUID
  scheduledAt: string;  // ISO datetime: "2024-06-15T08:00:00"
  takenAt?: string;     // ISO datetime
  status: IntakeStatus;
  notes?: string;
}

// Create/Update request interfaces
export interface MedicationPlanCreateRequest {
  patientId: string;  // UUID
  medicationName: string;
  dosage: string;
  form: MedicationForm;
  frequencyPerDay: number;
  startDate: string;
  endDate?: string;
  instructions?: string;
  active?: boolean;
}

export interface MedicationPlanUpdateRequest extends Partial<MedicationPlanCreateRequest> {}

export interface MedicationIntakeCreateRequest {
  planId?: string;  // UUID
  scheduledAt: string;
  takenAt?: string;
  status: IntakeStatus;
  notes?: string;
}

export interface MedicationIntakeUpdateRequest extends Partial<MedicationIntakeCreateRequest> {}
