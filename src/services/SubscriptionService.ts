import httpClient from './httpClient';

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  isActive: boolean;
  features: Record<string, boolean>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionPackageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  nextBillingDate: string;
  amountPaid: number;
}

export interface PaymentLinkData {
  paymentUrl: string;
  orderCode: number;
  qrCode: string;
  pendingSubscriptionId: string;
}

const SubscriptionService = {
  async getPackages(): Promise<SubscriptionPackage[]> {
    const res = await httpClient.get<{ success: boolean; data: SubscriptionPackage[] }>('/subscriptions/packages');
    return res.data ?? [];
  },

  async createPayment(packageId: string): Promise<PaymentLinkData> {
    const res = await httpClient.post<{ success: boolean; data: PaymentLinkData }>(
      '/subscriptions/create-payment',
      { packageId }
    );
    return res.data;
  },

  async getMySubscription(): Promise<UserSubscription | null> {
    try {
      const res = await httpClient.get<{ success: boolean; data: UserSubscription | null }>('/subscriptions/my');
      return res.data ?? null;
    } catch {
      return null;
    }
  },

  async confirmPayment(orderCode: number): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean; data: boolean }>(
      `/subscriptions/confirm-payment?orderCode=${orderCode}`
    );
    return !!res.success;
  },

  async cancelSubscription(): Promise<void> {
    await httpClient.delete<{ success: boolean }>('/subscriptions/cancel');
  },
};

export default SubscriptionService;
