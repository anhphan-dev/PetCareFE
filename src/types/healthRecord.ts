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
