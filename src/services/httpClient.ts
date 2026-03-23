
import { isTokenRevoked, revokeToken } from '../utils/tokenRevocation';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';
const USER_STORAGE_KEY = 'user';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

const httpClient = {
  async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build full URL with query params
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const query = searchParams.toString();
      if (query) fullUrl += `?${query}`;
    }

    // Headers + Auth
    const token = localStorage.getItem('authToken');
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      if (isTokenRevoked(token)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem(USER_STORAGE_KEY);
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Token da bi thu hoi. Vui long dang nhap lai.');
      }

      headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });
    } catch {
      throw new Error('Khong the ket noi den may chu. Vui long thu lai.');
    }

    // Xử lý lỗi chi tiết hơn
    if (!response.ok) {
      if (response.status === 401) {
        if (token) {
          revokeToken(token, tokenExpiresAt);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem(USER_STORAGE_KEY);
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Phien dang nhap het han hoac chua dang nhap. Vui long dang nhap lai.');
      }

      let errorMessage = 'Đã có lỗi xảy ra';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Nếu response rỗng (204 No Content), trả về null
    const text = await response.text();
    return text ? JSON.parse(text) : (null as T);
  },

  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET' });
  },

  post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  },
};

export default httpClient;