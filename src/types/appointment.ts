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
  userId?: string;
  userName?: string;
  petId: string;
  petName?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  appointmentType: string;
  branchId?: string;
  branchName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  appointmentDate: string;
  startTime: TimeSpan | string;
  endTime: TimeSpan | string;
  serviceAddress?: string;
  notes?: string;
  appointmentStatus?: string;
  status?: string;
  medicalNotes?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cấu trúc DTO cho PATCH trạng thái
export interface UpdateAppointmentStatusRequest {
  status: string;
  medicalNotes?: string;
  cancellationReason?: string;
}
