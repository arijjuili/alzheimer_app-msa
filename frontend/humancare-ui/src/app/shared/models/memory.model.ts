export enum MemoryCategory {
  FAMILY = 'FAMILY',
  FRIENDS = 'FRIENDS',
  PLACES = 'PLACES',
  EVENTS = 'EVENTS',
  HOBBIES = 'HOBBIES',
  WORK = 'WORK'
}

export interface MemoryItem {
  id: string;
  patientId: string;
  memoryCategory: MemoryCategory;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  yearTaken?: number;
  persons?: string[];
  questions?: string[];
  correctAnswers?: string[];
  storybookSelected: boolean;
  createdAt: string;
}

export interface MemoryItemCreateRequest {
  patientId: string;
  memoryCategory: MemoryCategory;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  yearTaken?: number;
  persons?: string[];
  questions?: string[];
  correctAnswers?: string[];
  storybookSelected?: boolean;
}

export interface MemoryItemUpdateRequest {
  memoryCategory?: MemoryCategory;
  title?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  yearTaken?: number;
  persons?: string[];
  questions?: string[];
  correctAnswers?: string[];
  storybookSelected?: boolean;
}
