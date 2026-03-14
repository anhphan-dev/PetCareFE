import { CartItem } from '../../types/cart';
import httpClient from '../httpClient';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

const unwrap = <T>(response: T | ApiResponse<T>): T | null => {
  if (response && typeof response === 'object' && 'success' in (response as ApiResponse<T>)) {
    return ((response as ApiResponse<T>).data as T) ?? null;
  }
  return (response as T) ?? null;
};

export const cartService = {
  async getCart(): Promise<CartItem[] | null> {
    try {
      const response = await httpClient.get<CartItem[] | ApiResponse<CartItem[]>>('/Cart');
      const data = unwrap<CartItem[]>(response);
      return Array.isArray(data) ? data : null;
    } catch (error: any) {
      console.error('[CartService] GET /Cart error:', error.message, error.response?.data);
      return null;
    }
  },

  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const response = await httpClient.post<ApiResponse<any>>('/Cart', { productId, quantity });
      return !!response?.success;
    } catch (error) {
      console.error('[CartService] POST /Cart error:', error);
      return false;
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      const response = await httpClient.put<ApiResponse<any>>(`/Cart/${cartItemId}`, { quantity });
      return !!response?.success;
    } catch (error) {
      console.error('[CartService] PUT /Cart error:', error);
      return false;
    }
  },

  // Hỗ trợ quantity query param cho DELETE (giảm quantity hoặc xóa hẳn)
  async removeCartItem(cartItemId: string, quantityToRemove: number = 1): Promise<boolean> {
    try {
      const params = quantityToRemove > 0 ? { quantity: quantityToRemove } : {};
      const response = await httpClient.delete<ApiResponse<any>>(`/Cart/${cartItemId}`, { params });
      return !!response?.success;
    } catch (error) {
      console.error('[CartService] DELETE /Cart/{id} error:', error);
      return false;
    }
  },

  async clearCart(): Promise<boolean> {
    try {
      const response = await httpClient.delete<ApiResponse<any>>('/Cart');
      return !!response?.success;
    } catch (error) {
      console.error('[CartService] DELETE /Cart error:', error);
      return false;
    }
  },
};