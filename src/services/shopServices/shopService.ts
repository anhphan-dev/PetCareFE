// src/services/shopServices/shopService.ts
import { Product, ProductCategory } from "../../types";
import httpClient from "../httpClient";

const BASE_URL = '/api/Products';  // prefix chung từ Swagger

const shopService = {
  // Lấy tất cả danh mục (có filter includeSubcategories, includeInactive)
  async getProductCategories(includeSubcategories = true, includeInactive = false): Promise<ProductCategory[]> {
    try {
      const response = await httpClient.get<any>('/ProductCategories', {
        params: { includeSubcategories, includeInactive },
      });

      // Xử lý wrapper response phổ biến trong Swagger .NET
      if (response?.data?.success && Array.isArray(response.data.data)) {
        return response.data.data as ProductCategory[];
      }
      if (Array.isArray(response?.data)) {
        return response.data as ProductCategory[];
      }
      return [];
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
      return [];
    }
  },

  // Lấy tất cả sản phẩm (GET /api/Products)
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await httpClient.get<any>(`${BASE_URL}`);
      return this.extractProducts(response);
    } catch (err) {
      console.error('Lỗi lấy tất cả sản phẩm:', err);
      return [];
    }
  },

  // Lấy sản phẩm theo category (GET /api/Products/category/{categoryId})
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const response = await httpClient.get<any>(`${BASE_URL}/category/${categoryId}`);
      return this.extractProducts(response);
    } catch (err) {
      console.error(`Lỗi lấy sản phẩm theo category ${categoryId}:`, err);
      return [];
    }
  },

  // Helper: extract mảng sản phẩm từ response (xử lý nhiều format)
  extractProducts(response: any): Product[] {
    if (!response) return [];

    const data = response.data ?? response;

    if (Array.isArray(data)) return data as Product[];

    if (data?.success && Array.isArray(data.data)) {
      return data.data as Product[];
    }

    if (data?.products && Array.isArray(data.products)) {
      return data.products;
    }

    return [];
  },

  // Bonus: Nếu cần search (GET /api/Products/search?query=abc)
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await httpClient.get<any>(`${BASE_URL}/search`, {
        params: { query },
      });
      return this.extractProducts(response);
    } catch (err) {
      return [];
    }
  },

  // Nếu cần lấy sản phẩm active (GET /api/Products/active)
  async getActiveProducts(): Promise<Product[]> {
    try {
      const response = await httpClient.get<any>(`${BASE_URL}/active`);
      return this.extractProducts(response);
    } catch (err) {
      return [];
    }
  },
};

export default shopService;