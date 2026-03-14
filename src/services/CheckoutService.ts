import httpClient from './httpClient';

export type CheckoutSummaryItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type CheckoutSummary = {
  items: CheckoutSummaryItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
};

export type PlaceOrderPayload = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingDistrict?: string;
  note?: string;
  paymentMethod?: string;
  returnBaseUrl?: string;
};

export type PlaceOrderResult = {
  id: string;
  orderNumber: string;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderedAt: string;
  paymentUrl?: string | null;
  orderCode?: number | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
};

export const CheckoutService = {
  async getSummary(): Promise<CheckoutSummary> {
    const response = await httpClient.get<ApiResponse<CheckoutSummary>>('/Checkout/summary');
    return response.data;
  },

  async placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
    const response = await httpClient.post<ApiResponse<PlaceOrderResult>>('/Checkout/place-order', payload);
    return response.data;
  },
};
