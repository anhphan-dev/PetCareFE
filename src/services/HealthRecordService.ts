import {
  CreateVaccinationRequest,
  DogRoutineSchedule,
  HealthRecordRequest,
  HealthRecordResponse,
  VaccineCatalogItem,
} from '../types/healthRecord';

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
    if (typeof body?.message === 'string' && body.message.trim()) return body.message;
    if (typeof body?.Message === 'string' && body.Message.trim()) return body.Message;
    if (typeof body?.title === 'string' && body.title.trim()) return body.title;

    // ASP.NET validation payload can include an errors dictionary
    if (body?.errors && typeof body.errors === 'object') {
      const firstError = Object.values(body.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [String(value)]))
        .find((text) => typeof text === 'string' && text.trim().length > 0);
      if (firstError) return String(firstError);
    }

    return fallback;
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

export const healthRecordService = {
  // CREATE
  async createHealthRecord(data: HealthRecordRequest): Promise<HealthRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/health-records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to create health record'));
    }

    const payload = await response.json();
    return unwrapApiResponse<HealthRecordResponse>(payload);
  },

  // GET BY PET ID
  async getHealthRecordsByPet(petId: string): Promise<HealthRecordResponse[]> {
    const response = await fetch(`${API_BASE_URL}/health-records/pet/${petId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // This is mocked logic if the endpoint doesn't exist, it might throw 404
    if (!response.ok) {
        if(response.status === 404) return [];
        throw new Error(await parseErrorMessage(response, 'Failed to fetch health records'));
    }

    const payload = await response.json();
    return unwrapApiResponse<HealthRecordResponse[]>(payload);
  },

  async getDogRoutineSchedule(petId: string): Promise<DogRoutineSchedule> {
    const response = await fetch(`${API_BASE_URL}/health-records/pet/${petId}/dog-routine`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch dog routine schedule'));
    }

    const payload = await response.json();
    return unwrapApiResponse<DogRoutineSchedule>(payload);
  },

  async addVaccination(petId: string, data: CreateVaccinationRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/health-records/pet/${petId}/vaccinations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to record vaccination'));
    }
  },

  async getVaccineCatalog(): Promise<VaccineCatalogItem[]> {
    const response = await fetch(`${API_BASE_URL}/health-records/vaccine-catalog`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch vaccine catalog'));
    }

    const payload = await response.json();
    return unwrapApiResponse<VaccineCatalogItem[]>(payload);
  },
};
