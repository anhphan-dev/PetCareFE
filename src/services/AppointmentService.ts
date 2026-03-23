import { AppointmentRequest, AppointmentResponse, UpdateAppointmentStatusRequest } from '../types/appointment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const appointmentService = {
  // CREATE
  async createAppointment(data: AppointmentRequest): Promise<AppointmentResponse> {
    const response = await fetch(`${API_BASE_URL}/Appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  // GET ALL (Có thể kèm status / date query)
  async getAppointments(status?: string, date?: string): Promise<AppointmentResponse[]> {
    let url = `${API_BASE_URL}/Appointments?`;
    if (status) url += `status=${status}&`;
    if (date) url += `date=${date}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  // GET MY APPOINTMENTS
  async getMyAppointments(): Promise<AppointmentResponse[]> {
    const response = await fetch(`${API_BASE_URL}/Appointments/my-appointments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch my appointments');
    return response.json();
  },

  // GET BY ID
  async getAppointmentById(id: string): Promise<AppointmentResponse> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch appointment by id');
    return response.json();
  },

  // UPDATE STATUS (Duyệt lịch / Hoàn thành)
  async updateStatus(id: string, data: UpdateAppointmentStatusRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update status');
  },

  // CANCEL APPOINTMENT
  async cancelAppointment(id: string, cancellationReason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancellationReason }),
    });
    if (!response.ok) throw new Error('Failed to cancel appointment');
  }
};
