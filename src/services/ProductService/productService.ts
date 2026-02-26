// src/services/productService.ts
import { Product } from '../../types';
import httpClient from '../httpClient';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await httpClient.get('/Products');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Lỗi lấy tất cả sản phẩm:', error);
      return [];
    }
  },

  /**
   * Lấy sản phẩm theo category ID (GUID)
   * GET /Products/category/{categoryId}
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const response = await httpClient.get(`/Products/category/${categoryId}`);

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Lỗi lấy sản phẩm theo categoryId ${categoryId}:`, error);
      return [];
    }
  },

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const response = await httpClient.get('/Products/search', {
        params: { searchTerm },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await httpClient.get(`/Products/${id}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Lỗi lấy sản phẩm ID ${id}:`, error);
      return null;
    }
  },
};