import type { Service, TeamMember, NewsArticle, ContactInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiService = {
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
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
