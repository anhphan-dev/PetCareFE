import httpClient from './httpClient';
import { User } from './AuthAPI';
import { isTokenRevoked, revokeToken } from '../utils/tokenRevocation';

function getValidTokenOrThrow(): string {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('Phien dang nhap het han hoac chua dang nhap. Vui long dang nhap lai.');
  }

  if (isTokenRevoked(token)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Token da bi thu hoi. Vui long dang nhap lai.');
  }

  // If token is valid at this point, it can be safely used by non-httpClient calls.
  return token;
}

// Profile Response Types
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
  errors: any[];
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    fileName: string;
  };
  errors: any[];
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    fileName: string;
  };
  errors: any[];
}

export interface ImageOptimizeResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
  errors: any[];
}

export const ProfileService = {
  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await httpClient.get<ProfileResponse>('/Profile/me');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: UpdateProfilePayload): Promise<User> {
    const response = await httpClient.put<ProfileResponse>('/Profile/me', data);
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await httpClient.post('/Profile/change-password', data);
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const token = getValidTokenOrThrow();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api'}/Profile/avatar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        revokeToken(token, expiresAt);
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw new Error('Failed to upload avatar');
    }

    const result = (await response.json()) as AvatarUploadResponse;
    return result.data.url;
  },

  // Delete avatar
  async deleteAvatar(): Promise<void> {
    await httpClient.delete('/Profile/avatar');
  },

  // Upload image
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const token = getValidTokenOrThrow();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api'}/Profile/upload-image`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        revokeToken(token, expiresAt);
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
      throw new Error('Failed to upload image');
    }

    const result = (await response.json()) as ImageUploadResponse;
    return result.data.url;
  },

  // Optimize image
  async optimizeImage(imageUrl: string): Promise<string> {
    const response = await httpClient.get<ImageOptimizeResponse>(
      '/Profile/optimize-image',
      {
        params: { imageUrl },
      }
    );
    return response.data.url;
  },
};
