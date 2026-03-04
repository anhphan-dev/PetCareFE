// src/services/CartService/cartService.ts
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
      const resData = response.data as ApiResponse<CartItem[] | CartItem>;

      console.log('[CartService] Raw GET /Cart response:', resData);

      if (resData?.success) {
        if (Array.isArray(resData.data)) return resData.data;
        if (resData.data && 'items' in resData.data && Array.isArray(resData.data.items)) {
          return resData.data.items;
        }
      }

      if (Array.isArray(resData)) return resData as CartItem[];

      console.warn('[CartService] getCart format lạ:', resData);
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

      console.log('[CartService] Raw POST /Cart response:', resData);

      if (resData?.success) {
        return true;
      }

      console.warn('[CartService] addToCart failed:', resData?.message || resData);
      return false;
    } catch (error: any) {
      console.error('[CartService] POST /Cart error:', error.message, error.response?.data);
      return false;
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    if (quantity < 1) return false;
    try {
      const response = await httpClient.put(`/Cart/${cartItemId}`, { quantity });
      const resData = response.data as ApiResponse<any>;

      console.log('[CartService] Raw PUT /Cart response:', resData);

      return !!resData?.success;
    } catch (error: any) {
      console.error('[CartService] PUT error:', error.message);
      return false;
    }
  },

  async removeCartItem(cartItemId: string): Promise<boolean> {
    try {
      const response = await httpClient.delete(`/Cart/${cartItemId}`);
      const resData = response.data as ApiResponse<any>;

      console.log('[CartService] Raw DELETE item response:', resData);

      return !!resData?.success;
    } catch (error: any) {
      console.error('[CartService] DELETE item error:', error.message);
      return false;
    }
  },

  async clearCart(): Promise<boolean> {
    try {
      const response = await httpClient.delete('/Cart');
      const resData = response.data as ApiResponse<any>;

      console.log('[CartService] Raw DELETE /Cart response:', resData);

      return !!resData?.success;
    } catch (error: any) {
      console.error('[CartService] clearCart error:', error.message);
      return false;
    }
  },

  async getCartTotal(): Promise<number> {
    try {
      const response = await httpClient.get('/Cart/total');
      const resData = response.data as ApiResponse<number>;

      console.log('[CartService] Raw GET /Cart/total:', resData);

      if (resData?.success && typeof resData.data === 'number') {
        return resData.data;
      }
      return 0;
    } catch (error: any) {
      console.error('[CartService] getCartTotal error:', error.message);
      return 0;
    }
  },
};