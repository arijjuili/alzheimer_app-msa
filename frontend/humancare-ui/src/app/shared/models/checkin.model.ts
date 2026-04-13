export enum MoodType {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  BAD = 'BAD'
}

export enum SleepQuality {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  BAD = 'BAD'
}

export interface SymptomCheck {
  id?: string;
  dailyCheckinId?: string;
  symptomType: string;
  severity: number;
  present: boolean;
  notes?: string;
}

export interface DailyCheckin {
  id: string;
  patientId: string;
  mood: MoodType;
  energyLevel: number;
  sleepQuality: SleepQuality;
  notes?: string;
  checkinDate: string; // ISO date YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
  symptoms?: SymptomCheck[];
}

export interface CreateDailyCheckinRequest {
  patientId: string;
  mood: MoodType;
  energyLevel: number;
  sleepQuality: SleepQuality;
  notes?: string;
  checkinDate: string;
  symptoms?: SymptomCheckRequest[];
}

export interface UpdateDailyCheckinRequest {
  mood: MoodType;
  energyLevel: number;
  sleepQuality: SleepQuality;
  notes?: string;
  symptoms?: SymptomCheckRequest[];
}

export interface SymptomCheckRequest {
  symptomType: string;
  severity: number;
  present: boolean;
  notes?: string;
}
