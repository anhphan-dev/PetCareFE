// src/services/shopService.ts

import { ProductCategory } from "../../types";
import httpClient from "../httpClient";

const shopService = {
  async getProductCategories(includeSubcategories = true, includeInactive = false) {
    const response = await httpClient.get<any>('/ProductCategories', {
      params: {
        includeSubcategories,
        includeInactive,
      },
    });

    // Extract mảng từ response.data (theo format Swagger)
    if (response && response.success && Array.isArray(response.data)) {
      return response.data as ProductCategory[];
    }

    console.warn('API ProductCategories format không đúng:', response);
    return [];
  },

  async getAllProducts() {
    const response = await httpClient.get<any>('/Products');
    return Array.isArray(response) ? response : (response?.data || []);
  },

  async getProductsByCategory(categoryId: number | string) {
    const response = await httpClient.get<any>(`/Products/category/${categoryId}`);
    return Array.isArray(response) ? response : (response?.data || []);
  },

  // Các hàm khác giữ nguyên nếu cần
};

export default shopService;