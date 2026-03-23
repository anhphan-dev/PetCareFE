import { HealthRecordRequest, HealthRecordResponse } from '../types/healthRecord';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const healthRecordService = {
  // CREATE
  async createHealthRecord(data: HealthRecordRequest): Promise<HealthRecordResponse> {
    const response = await fetch(`${API_BASE_URL}/HealthRecords`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create health record');
    return response.json();
  },

  // GET BY PET ID
  async getHealthRecordsByPet(petId: string): Promise<HealthRecordResponse[]> {
    const response = await fetch(`${API_BASE_URL}/HealthRecords/pet/${petId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // This is mocked logic if the endpoint doesn't exist, it might throw 404
    if (!response.ok) {
        if(response.status === 404) return [];
        throw new Error('Failed to fetch health records');
    }
    return response.json();
  },
};
