export interface TimeSpan {
  ticks: number;
}

export interface AppointmentRequest {
  petId: string;
  serviceId: string;
  appointmentType: string;
  branchId?: string;
  appointmentDate: string; // ISO 8601 string
  startTime: TimeSpan;
  endTime: TimeSpan;
  serviceAddress?: string;
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  petId: string;
  serviceId: string;
  appointmentType: string;
  branchId: string;
  appointmentDate: string;
  startTime: TimeSpan | string;
  endTime: TimeSpan | string;
  serviceAddress: string;
  notes: string;
  status: string; // Pending, Accepted, Completed, Cancelled
  medicalNotes?: string;
  cancellationReason?: string;
}

// Cấu trúc DTO cho PATCH trạng thái
export interface UpdateAppointmentStatusRequest {
  status: string;
  medicalNotes?: string;
  cancellationReason?: string;
}
