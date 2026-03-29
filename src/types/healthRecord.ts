export interface HealthRecordRequest {
  petId: string;
  recordDate?: string;
  weight?: number;
  height?: number;
  temperature?: number;
  heartRate?: number;
  diagnosis?: string;
  treatment?: string;
  notes?: string;

  // Backward-compatible optional fields used by existing provider UI.
  appointmentId?: string;
  medication?: string;
  followUpDate?: string;
}

export interface HealthRecordResponse {
  id: string;
  petId: string;
  petName?: string;
  recordDate: string;
  weight?: number;
  height?: number;
  temperature?: number;
  heartRate?: number;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  recordedBy?: string;
  recordedByName?: string;
  createdAt: string;
}

export interface DogRoutineItem {
  category: string;
  itemName: string;
  dueDate?: string;
  lastCompletedDate?: string;
  frequency: string;
  status: string;
  source: string;
}

export interface DogRoutineSchedule {
  petId: string;
  petName: string;
  isDog: boolean;
  dateOfBirth?: string;
  note?: string;
  vaccinations: DogRoutineItem[];
  deworming: DogRoutineItem[];
}

export interface CreateVaccinationRequest {
  vaccineCode?: string;
  vaccineName: string;
  vaccinationDate?: string;
  nextDueDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface VaccinationResponse {
  id: string;
  petId: string;
  vaccineCode?: string;
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate?: string;
  batchNumber?: string;
  administeredBy?: string;
  notes?: string;
  createdAt: string;
}

export interface VaccineCatalogItem {
  code: string;
  displayName: string;
  aliases: string[];
  defaultIntervalDays?: number;
}
