// src/lib/httpClient.ts  (hoặc src/services/httpClient.ts)

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://petcare-api-2026-bad653588c75.herokuapp.com/api';

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    // Xử lý lỗi chi tiết hơn
    if (!response.ok) {
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
    return text ? JSON.parse(text) : null;
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

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  },
};

export default httpClient;