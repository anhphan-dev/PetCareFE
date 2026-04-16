// src/services/ProductService/productService.ts
import { Product } from '../../types/product';
import httpClient from '../httpClient';

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProductCategoryDto {
  id: string;
  categoryName: string;
  isActive: boolean;
}

const unwrapPayload = (payload: any) => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data != null) {
    return payload.data;
  }
  return payload;
};

export const productService = {
  async getProductCategories(): Promise<ProductCategoryDto[]> {
    try {
      const response = await httpClient.get<any>('/ProductCategories');
      const data = unwrapPayload(response);

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      return raw.filter((item: ProductCategoryDto) => item?.isActive ?? true);
    } catch (error: any) {
      console.error('Lỗi lấy danh mục sản phẩm:', error.message);
      return [];
    }
  },

  /**
   * Lấy tất cả sản phẩm (phân trang)
   */
  async getAllProducts(
    page: number = 1,
    pageSize: number = 8
  ): Promise<PaginatedResponse<Product> | null> {
    try {
      const response = await httpClient.get<any>('/Products', {
        params: { page, pageSize },
      });

      const data = unwrapPayload(response);

      if (data?.items && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount || data.items.length,
          page: data.page || page,
          pageSize: data.pageSize || pageSize,
          totalPages: data.totalPages || Math.ceil((data.totalCount || data.items.length) / pageSize),
        };
      }

      // Fallback nếu API trả mảng trực tiếp
      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          page,
          pageSize,
          totalPages: 1,
        };
      }

      console.warn('API /Products trả format không chuẩn:', data);
      return null;
    } catch (error: any) {
      console.error('Lỗi lấy tất cả sản phẩm:', error.message);
      return null;
    }
  },

  /**
   * Lấy sản phẩm theo category ID (phân trang)
   */
  async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    pageSize: number = 8
  ): Promise<PaginatedResponse<Product> | null> {
    try {
      const response = await httpClient.get<any>(`/Products/category/${categoryId}`, {
        params: { page, pageSize },
      });

      const data = unwrapPayload(response);

      if (data?.items && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount || data.items.length,
          page: data.page || page,
          pageSize: data.pageSize || pageSize,
          totalPages: data.totalPages || Math.ceil((data.totalCount || data.items.length) / pageSize),
        };
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          page,
          pageSize,
          totalPages: 1,
        };
      }

      console.warn(`API /Products/category/${categoryId} trả format không chuẩn:`, data);
      return null;
    } catch (error: any) {
      console.error(`Lỗi lấy sản phẩm category ${categoryId}:`, error.message);
      return null;
    }
  },

  /**
   * Tìm kiếm sản phẩm (phân trang)
   */
  async searchProducts(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 8
  ): Promise<PaginatedResponse<Product> | null> {
    try {
      const response = await httpClient.get<any>('/Products/search', {
        params: { searchTerm, page, pageSize },
      });

      const data = unwrapPayload(response);

      if (data?.items && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount || data.items.length,
          page: data.page || page,
          pageSize: data.pageSize || pageSize,
          totalPages: data.totalPages || Math.ceil((data.totalCount || data.items.length) / pageSize),
        };
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          page,
          pageSize,
          totalPages: 1,
        };
      }

      console.warn('API /Products/search trả format không chuẩn:', data);
      return null;
    } catch (error: any) {
      console.error('Lỗi tìm kiếm sản phẩm:', error.message);
      return null;
    }
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await httpClient.get<any>(`/Products/${id}`);
      const data = unwrapPayload(response);
      return data ?? null;
    } catch (error: any) {
      console.error(`Lỗi lấy sản phẩm ID ${id}:`, error.message);
      return null;
    }
  },
};