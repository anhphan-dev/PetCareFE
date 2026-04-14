
import type { ContactInfo, NewsArticle, Service, TeamMember } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

interface ServiceResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
  
export const apiService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
  },

  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/services`);
    if (!response.ok) throw new Error('Failed to fetch services');

    const payload = (await response.json()) as ServiceResponse<Service[]> | Service[];
    if (Array.isArray(payload)) return payload;
    if (!payload.success) throw new Error(payload.message || 'Failed to fetch services');
    return payload.data ?? [];
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/team`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },

  async getNewsArticles(): Promise<NewsArticle[]> {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) throw new Error('Failed to fetch news articles');
    return response.json();
  },

  async getContactInfo(): Promise<ContactInfo> {
    const response = await fetch(`${API_BASE_URL}/contact`);
    if (!response.ok) throw new Error('Failed to fetch contact info');
    return response.json();
  },

  async bookAppointment(data: {
    name: string;
    email: string;
    phone: string;
    petName: string;
    serviceType: string;
    date: string;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to book appointment');
    return response.json();
  },

  async subscribeNewsletter(email: string) {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to subscribe');
    return response.json();
  },
};
