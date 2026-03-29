import { AppointmentRequest, AppointmentResponse, UpdateAppointmentStatusRequest } from '../types/appointment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return body?.message || body?.title || fallback;
  } catch {
    return fallback;
  }
};

const unwrapApiResponse = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    const wrapped = payload as ApiResponse<T>;
    if (!wrapped.success) {
      throw new Error(wrapped.message || 'Request failed');
    }
    return wrapped.data as T;
  }
  return payload as T;
};

const normalizeAppointment = (appointment: AppointmentResponse): AppointmentResponse => ({
  ...appointment,
  appointmentStatus: appointment.appointmentStatus || appointment.status,
  status: appointment.status || appointment.appointmentStatus,
});

const buildAppointmentsUrl = (status?: string, date?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (date) params.append('date', date);
  const query = params.toString();
  return `${API_BASE_URL}/Appointments${query ? `?${query}` : ''}`;
};

export const appointmentService = {
  // CREATE
  async createAppointment(data: AppointmentRequest): Promise<AppointmentResponse> {
    const response = await fetch(`${API_BASE_URL}/Appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to create appointment'));
    }

    const payload = await response.json();
    return normalizeAppointment(unwrapApiResponse<AppointmentResponse>(payload));
  },

  // GET ALL (Có thể kèm status / date query)
  async getAppointments(status?: string, date?: string): Promise<AppointmentResponse[]> {
    const response = await fetch(buildAppointmentsUrl(status, date), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch appointments'));
    }

    const payload = await response.json();
    return unwrapApiResponse<AppointmentResponse[]>(payload).map(normalizeAppointment);
  },

  // Backward-compatible alias used by Doctor dashboard
  async getAllAppointments(status?: string, date?: string): Promise<AppointmentResponse[]> {
    return this.getAppointments(status, date);
  },

  // GET MY APPOINTMENTS
  async getMyAppointments(): Promise<AppointmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/Appointments/my-appointments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch my appointments'));
    }

    const payload = await response.json();
    return unwrapApiResponse<AppointmentResponse[]>(payload).map(normalizeAppointment);
  },

  // GET BY ID
  async getAppointmentById(id: string): Promise<AppointmentResponse> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch appointment by id'));
    }

    const payload = await response.json();
    return normalizeAppointment(unwrapApiResponse<AppointmentResponse>(payload));
  },

  // UPDATE STATUS (Duyệt lịch / Hoàn thành)
  async updateStatus(id: string, data: UpdateAppointmentStatusRequest): Promise<AppointmentResponse> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to update status'));
    }

    const payload = await response.json();
    return normalizeAppointment(unwrapApiResponse<AppointmentResponse>(payload));
  },

  // CANCEL APPOINTMENT
  async cancelAppointment(id: string, cancellationReason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancellationReason }),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to cancel appointment'));
    }
  }
};

export const AppointmentService = appointmentService;
export type { AppointmentResponse };
