export interface CartItem {
  id: string;                // cartItemId
  productId: string;
  quantity: number;
  product?: {                // optional, nếu API trả về chi tiết product
    productName: string;
    price: number;
    salePrice?: number;
    images?: string[];
    stockQuantity: number;
  };
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[] | string | null;  // tùy endpoint
  errors: string[];
}

export interface CartTotalResponse {
  success: boolean;
  message: string;
  data: number;  // tổng số lượng items (hoặc tổng tiền nếu backend thay đổi)
  errors: string[];
}