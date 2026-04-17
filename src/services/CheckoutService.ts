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
  hasMembershipDiscount?: boolean;
  membershipDiscountRate?: number;
  membershipDiscountAmount?: number;
  hasVoucherDiscount?: boolean;
  voucherCode?: string | null;
  voucherDiscountAmount?: number;
  voucherMessage?: string;
  discountAmount: number;
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
  voucherCode?: string;
  returnBaseUrl?: string;
};

export type PlaceOrderResult = {
  id: string;
  orderNumber: string;
  totalAmount?: number;
  membershipDiscountAmount?: number;
  voucherDiscountAmount?: number;
  voucherCode?: string | null;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderedAt: string;
  paymentUrl?: string | null;
  orderCode?: number | null;
};

export type ActiveVoucher = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  validTo: string;
  remainingUses?: number | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
};

export const CheckoutService = {
  async getSummary(voucherCode?: string): Promise<CheckoutSummary> {
    const query = voucherCode?.trim() ? `?voucherCode=${encodeURIComponent(voucherCode.trim())}` : '';
    const response = await httpClient.get<ApiResponse<CheckoutSummary>>(`/Checkout/summary${query}`);
    return response.data;
  },

  async placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
    const response = await httpClient.post<ApiResponse<PlaceOrderResult>>('/Checkout/place-order', payload);
    return response.data;
  },

  async getActiveVouchers(limit = 6): Promise<ActiveVoucher[]> {
    const response = await httpClient.get<ApiResponse<ActiveVoucher[]>>(`/Checkout/active-vouchers?limit=${limit}`);
    return response.data ?? [];
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
