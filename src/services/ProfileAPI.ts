import httpClient from './httpClient';
import { User } from './AuthAPI';

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

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://localhost:54813/api'}/Profile/avatar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
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

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://localhost:54813/api'}/Profile/upload-image`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
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
