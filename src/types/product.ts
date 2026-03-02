export interface Product {
  id: string;
  product_name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  category_name: string;
  images: string[];
  is_active: boolean;
  sku?: string | null;
  created_at: string;
  updated_at: string;
}

export type CategoryKey = 'thuc-an' | 'do-choi' | 've-sinh';

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
}
