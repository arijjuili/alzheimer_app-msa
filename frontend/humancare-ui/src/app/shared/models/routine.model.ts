export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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
  timeOfDay?: string;
  isActive: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  lastCompletedDate?: string;
  streak?: number;
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

export interface RoutineCompletion {
  id: string;
  routineId: string;
  patientId: string;
  completedAt: string;
  date: string;
}
