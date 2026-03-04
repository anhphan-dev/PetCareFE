import { CartItem } from '../../types/cart';
import httpClient from '../httpClient';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export const cartService = {
  async getCart(): Promise<CartItem[] | null> {
    try {
      const response = await httpClient.get('/Cart');
      const resData = response.data as ApiResponse<CartItem[]>;

      if (resData?.success && Array.isArray(resData.data)) {
        return resData.data;
      }

      if (Array.isArray(resData)) {
        return resData as CartItem[];
      }

      return null;
    } catch (error: any) {
      console.error('[CartService] GET /Cart error:', error.message, error.response?.data);
      return null;
    }
  },

  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const response = await httpClient.post('/Cart', { productId, quantity });
      const resData = response.data as ApiResponse<any>;
      return !!resData?.success;
    } catch (error) {
      console.error('[CartService] POST /Cart error:', error);
      return false;
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      const response = await httpClient.put(`/Cart/${cartItemId}`, { quantity });
      const resData = response.data as ApiResponse<any>;
      return !!resData?.success;
    } catch (error) {
      console.error('[CartService] PUT /Cart error:', error);
      return false;
    }
  },

  // Hỗ trợ quantity query param cho DELETE (giảm quantity hoặc xóa hẳn)
  async removeCartItem(cartItemId: string, quantityToRemove: number = 1): Promise<boolean> {
    try {
      const params = quantityToRemove > 0 ? { quantity: quantityToRemove } : {};
      const response = await httpClient.delete(`/Cart/${cartItemId}`, { params });
      const resData = response.data as ApiResponse<any>;
      return !!resData?.success;
    } catch (error) {
      console.error('[CartService] DELETE /Cart/{id} error:', error);
      return false;
    }
  },

  async clearCart(): Promise<boolean> {
    try {
      const response = await httpClient.delete('/Cart');
      const resData = response.data as ApiResponse<any>;
      return !!resData?.success;
    } catch (error) {
      console.error('[CartService] DELETE /Cart error:', error);
      return false;
    }
  },
};