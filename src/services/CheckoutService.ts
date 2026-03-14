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

  async confirmPayment(orderCode?: number, orderNumber?: string): Promise<boolean> {
    const params = new URLSearchParams();

    if (orderCode && orderCode > 0) {
      params.set('orderCode', String(orderCode));
    }

    if (orderNumber && orderNumber.trim().length > 0) {
      params.set('orderNumber', orderNumber.trim());
    }

    const query = params.toString();
    const response = await httpClient.post<ApiResponse<{ confirmed: boolean; alreadyConfirmed?: boolean }>>(
      `/Checkout/confirm-payment${query ? `?${query}` : ''}`
    );

    return Boolean(response?.success);
  },
};
