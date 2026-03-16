export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  stockQuantity: number;
  imageUrl?: string | null;
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