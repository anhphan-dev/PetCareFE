import httpClient from './httpClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthData {
  token: string;
  expiresAt: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
  errors: any[];
}

export interface UserInfo extends User {}

export const AuthService = {
  async login(data: LoginPayload): Promise<AuthData> {
    const response = await httpClient.post<AuthResponse>('/Auth/login', data);
    return response.data;
  },

  async register(data: RegisterPayload): Promise<AuthData> {
    const response = await httpClient.post<AuthResponse>('/Auth/register', data);
    return response.data;
  },

  getMe(): Promise<UserInfo> {
    return httpClient.get<UserInfo>('/Auth/me');
  },

  logout() {
    return httpClient.post('/Auth/logout');
  },

  async refreshToken(): Promise<AuthData> {
    const response = await httpClient.post<AuthResponse>('/Auth/refresh');
    return response.data;
  },
};