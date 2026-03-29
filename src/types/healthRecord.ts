export interface HealthRecordRequest {
  petId: string;
  appointmentId: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  notes: string;
  followUpDate?: string;
}

export interface HealthRecordResponse {
  id: string;
  petId: string;
  appointmentId: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  notes: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
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

export interface VaccineCatalogItem {
  code: string;
  displayName: string;
  aliases: string[];
  defaultIntervalDays?: number;
}
