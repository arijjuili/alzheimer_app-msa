export enum RoutineFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface Routine {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  frequency: RoutineFrequency;
  timeOfDay?: string; // HH:mm:ss
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineRequest {
  patientId: string;
  title: string;
  description?: string;
  frequency: RoutineFrequency;
  timeOfDay?: string;
}

export interface UpdateRoutineRequest {
  title: string;
  description?: string;
  frequency: RoutineFrequency;
  timeOfDay?: string;
  isActive: boolean;
}
