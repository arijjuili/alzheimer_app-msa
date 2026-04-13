export enum MemoryType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  NOTE = 'NOTE'
}

export interface MemoryItem {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  memoryDate?: string; // YYYY-MM-DD
  memoryType: MemoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemoryItemRequest {
  patientId: string;
  title: string;
  description?: string;
  memoryDate?: string;
  memoryType: MemoryType;
}

export interface UpdateMemoryItemRequest {
  title: string;
  description?: string;
  memoryDate?: string;
  memoryType: MemoryType;
}
