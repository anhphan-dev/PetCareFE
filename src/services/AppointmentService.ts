import {
  AppointmentCatalogService,
  AppointmentRequest,
  AppointmentResponse,
  UpdateAppointmentStatusRequest,
} from '../types/appointment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';
const APPOINTMENTS = `${API_BASE_URL}/appointments`;

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
    const body = (await response.json()) as Record<string, unknown>;
    if (body?.errors && typeof body.errors === 'object' && body.errors !== null) {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(body.errors as Record<string, unknown>)) {
        if (Array.isArray(val)) parts.push(...val.map((x) => `${key}: ${String(x)}`));
        else parts.push(`${key}: ${String(val)}`);
      }
      if (parts.length) return parts.join(' ');
    }
    const msg =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.title === 'string' && body.title) ||
      (typeof body?.detail === 'string' && body.detail);
    return msg || fallback;
  } catch {
    return fallback;
  }
};

/**
 * API PATCH /appointments/{id}/status — chỉ chấp nhận (message từ server):
 * pending, confirmed, in-progress, completed, cancelled
 */
export function serializeAppointmentStatusForPatch(status: string): string {
  const v = status.trim().toLowerCase().replace(/\s+/g, '').replace(/_/g, '-');
  if (v === 'pending') return 'pending';
  if (v === 'confirmed') return 'confirmed';
  if (v === 'in-progress' || v === 'inprogress') return 'in-progress';
  if (v === 'completed') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  return status.trim();
}

function buildUpdateStatusPayload(data: UpdateAppointmentStatusRequest): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    status: serializeAppointmentStatusForPatch(data.status),
  };
  if (data.medicalNotes != null && data.medicalNotes !== '') {
    payload.medicalNotes = data.medicalNotes;
  }
  if (data.cancellationReason != null && data.cancellationReason !== '') {
    payload.cancellationReason = data.cancellationReason;
  }
  return payload;
}

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

/**
 * GET /appointments?date= — PostgreSQL timestamptz + Npgsql yêu cầu DateTime UTC ở phía server.
 * Chuỗi chỉ có yyyy-MM-dd thường bị bind Kind=Unspecified và gây lỗi.
 * Gửi cùng ngày dương lịch ở UTC nửa đêm (ISO có Z).
 */
export function normalizeAppointmentDateQueryParam(date: string): string {
  const trimmed = date.trim();
  if (!trimmed) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  return trimmed;
}

const buildAppointmentsUrl = (status?: string, date?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (date) params.append('date', normalizeAppointmentDateQueryParam(date));
  const query = params.toString();
  return `${APPOINTMENTS}${query ? `?${query}` : ''}`;
};

/** Chuẩn hoá giờ từ API (TimeSpan JSON hoặc "HH:mm:ss") để hiển thị HH:mm */
export function formatAppointmentTime(
  value: AppointmentResponse['startTime'] | AppointmentResponse['endTime'] | undefined
): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    const m = value.match(/(\d{1,2}):(\d{2})/);
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : value;
  }
  if (typeof value === 'object' && 'ticks' in value) {
    const totalSeconds = Math.floor(value.ticks / 10_000_000);
    const h = Math.floor(totalSeconds / 3600) % 24;
    const m = Math.floor(totalSeconds / 60) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return '';
}

export function formatAppointmentCalendarDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate.split('T')[0] ?? isoDate;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** Dòng lịch map từ API cho trang bác sĩ */
export type DoctorAppointmentRow = {
  id: string;
  customerName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  serviceName?: string;
  petName?: string;
  appointmentType?: string;
  branchName?: string;
  serviceAddress?: string;
};

function mapApiStatusToDoctorUi(
  s: string | undefined
): DoctorAppointmentRow['status'] {
  const v = (s || 'pending').toLowerCase();
  if (v === 'pending') return 'Pending';
  if (v === 'confirmed') return 'Confirmed';
  if (v === 'in-progress') return 'InProgress';
  if (v === 'completed') return 'Completed';
  if (v === 'cancelled') return 'Cancelled';
  return 'Pending';
}

function mapAppointmentToDoctorRow(a: AppointmentResponse): DoctorAppointmentRow {
  return {
    id: a.id,
    customerName: a.userName?.trim() || 'Khách hàng',
    date: formatAppointmentCalendarDate(a.appointmentDate),
    time: formatAppointmentTime(a.startTime),
    reason: (a.notes || '').trim() || '—',
    status: mapApiStatusToDoctorUi(a.appointmentStatus || a.status),
    serviceName: a.serviceName?.trim() || undefined,
    petName: a.petName?.trim() || undefined,
    appointmentType: a.appointmentType,
    branchName: a.branchName?.trim() || undefined,
    serviceAddress: a.serviceAddress?.trim() || undefined,
  };
}

export const appointmentService = {
  /** Danh sách dịch vụ (public) — GET /api/appointments/services */
  async getServices(): Promise<AppointmentCatalogService[]> {
    const response = await fetch(`${APPOINTMENTS}/services`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch services'));
    }
    const payload = await response.json();
    return unwrapApiResponse<AppointmentCatalogService[]>(payload);
  },

  // CREATE
  async createAppointment(data: AppointmentRequest): Promise<AppointmentResponse> {
    const body: Record<string, unknown> = {
      serviceId: data.serviceId,
      appointmentType: data.appointmentType,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
    };
    if (data.petId) body.petId = data.petId;
    if (data.branchId) body.branchId = data.branchId;
    if (data.serviceAddress) body.serviceAddress = data.serviceAddress;
    if (data.notes != null && data.notes !== '') body.notes = data.notes;

    const response = await fetch(APPOINTMENTS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
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
    const response = await fetch(`${APPOINTMENTS}/my-appointments`, {
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
    const response = await fetch(`${APPOINTMENTS}/${id}`, {
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
    const response = await fetch(`${APPOINTMENTS}/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(buildUpdateStatusPayload(data)),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to update status'));
    }

    const payload = await response.json();
    return normalizeAppointment(unwrapApiResponse<AppointmentResponse>(payload));
  },

  // CANCEL APPOINTMENT (khách hàng)
  async cancelAppointment(id: string, cancellationReason = ''): Promise<void> {
    const response = await fetch(`${APPOINTMENTS}/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancellationReason }),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to cancel appointment'));
    }
  },

  /** Danh sách lịch theo ngày (Doctor / Admin) — map sang UI trang bác sĩ */
  async getDoctorAppointments(date: string): Promise<DoctorAppointmentRow[]> {
    const rows = await this.getAppointments(undefined, date);
    return rows.map(mapAppointmentToDoctorRow);
  },

  async confirmAppointment(id: string): Promise<AppointmentResponse> {
    return this.updateStatus(id, { status: 'confirmed' });
  },

  /** Chuyển lịch sang đang thực hiện (bác sĩ / admin) */
  async startInProgress(id: string): Promise<AppointmentResponse> {
    return this.updateStatus(id, { status: 'in-progress' });
  },

  async completeAppointment(id: string): Promise<AppointmentResponse> {
    return this.updateStatus(id, { status: 'completed' });
  },
};

export const AppointmentService = appointmentService;
export type { AppointmentResponse };
