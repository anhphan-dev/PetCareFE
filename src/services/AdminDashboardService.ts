import httpClient from './httpClient';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export interface AdminUserSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  roleName?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {}

export interface AdminProductSummary {
  id: string;
  productName: string;
  stockQuantity: number;
  categoryName?: string | null;
  isActive: boolean;
  price: number;
  salePrice?: number | null;
}

export interface AdminBlogSummary {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  categoryName?: string | null;
  authorName?: string | null;
  createdAt: string;
}

export interface AdminDashboardData {
  totals: {
    users: number;
    activeUsers: number;
    newUsersThisMonth: number;
    products: number;
    activeProducts: number;
    lowStockProducts: number;
    blogs: number;
    publishedBlogs: number;
    totalBlogViews: number;
    totalRevenue: number;
    revenueThisMonth: number;
    totalOrders: number;
    paidOrders: number;
    totalVouchers: number;
    activeVouchers: number;
    expiringVouchers: number;
  };
  recentUsers: AdminUserSummary[];
  lowStockProducts: AdminProductSummary[];
  topPosts: AdminBlogSummary[];
  latestPosts: AdminBlogSummary[];
  topVouchers: AdminVoucherSummary[];
}

export interface AdminUsersPagedResult {
  items: AdminUserSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export type CreateUserPayload = {
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  district?: string;
  password: string;
  roleName?: string;
};

export type UpdateUserPayload = {
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  district?: string;
  newPassword?: string;
};

export type SetUserRolePayload = {
  roleName: string;
};

export interface AdminVoucherSummary {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
  isActive: boolean;
  validTo: string;
  usedCount: number;
  usageLimit?: number | null;
  remainingUsage?: number | null;
}

export interface AdminVoucher {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface VoucherPagedResult {
  items: AdminVoucher[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type CreateVoucherPayload = {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
};

export type UpdateVoucherPayload = {
  name?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
};

const unwrap = <T>(response: T | ApiEnvelope<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiEnvelope<T>)) {
    return ((response as ApiEnvelope<T>).data as T) ?? (response as T);
  }

  return response as T;
};

const isNotFoundOrForbidden = (message: string) => {
  const lower = message.toLowerCase();
  return lower.includes('not found') || lower.includes('forbidden');
};

const AdminDashboardService = {
  async getOverview(): Promise<AdminDashboardData> {
    const response = await httpClient.get<ApiEnvelope<AdminDashboardData>>('/AdminDashboard/overview');
    const raw = unwrap(response);

    return {
      totals: {
        users: Number(raw?.totals?.users ?? 0),
        activeUsers: Number(raw?.totals?.activeUsers ?? 0),
        newUsersThisMonth: Number(raw?.totals?.newUsersThisMonth ?? 0),
        products: Number(raw?.totals?.products ?? 0),
        activeProducts: Number(raw?.totals?.activeProducts ?? 0),
        lowStockProducts: Number(raw?.totals?.lowStockProducts ?? 0),
        blogs: Number(raw?.totals?.blogs ?? 0),
        publishedBlogs: Number(raw?.totals?.publishedBlogs ?? 0),
        totalBlogViews: Number(raw?.totals?.totalBlogViews ?? 0),
        totalRevenue: Number(raw?.totals?.totalRevenue ?? 0),
        revenueThisMonth: Number(raw?.totals?.revenueThisMonth ?? 0),
        totalOrders: Number(raw?.totals?.totalOrders ?? 0),
        paidOrders: Number(raw?.totals?.paidOrders ?? 0),
        totalVouchers: Number(raw?.totals?.totalVouchers ?? 0),
        activeVouchers: Number(raw?.totals?.activeVouchers ?? 0),
        expiringVouchers: Number(raw?.totals?.expiringVouchers ?? 0),
      },
      recentUsers: raw?.recentUsers ?? [],
      lowStockProducts: raw?.lowStockProducts ?? [],
      topPosts: raw?.topPosts ?? [],
      latestPosts: raw?.latestPosts ?? [],
      topVouchers: raw?.topVouchers ?? [],
    };
  },

  async getVouchers(page = 1, pageSize = 20, search = ''): Promise<VoucherPagedResult> {
    const response = await httpClient.get<ApiEnvelope<VoucherPagedResult>>('/AdminDashboard/vouchers', {
      params: { page, pageSize, search: search || undefined },
    });

    const raw = unwrap(response) as VoucherPagedResult;
    return {
      items: raw?.items ?? [],
      totalCount: Number(raw?.totalCount ?? 0),
      page: Number(raw?.page ?? 1),
      pageSize: Number(raw?.pageSize ?? pageSize),
    };
  },

  async getUsers(page = 1, pageSize = 20): Promise<AdminUsersPagedResult> {
    try {
      const response = await httpClient.get<ApiEnvelope<AdminUsersPagedResult>>('/AdminDashboard/users', {
        params: { page, pageSize },
      });

      const raw = unwrap(response) as AdminUsersPagedResult;
      return {
        items: raw?.items ?? [],
        totalCount: Number(raw?.totalCount ?? 0),
        page: Number(raw?.page ?? page),
        pageSize: Number(raw?.pageSize ?? pageSize),
        totalPages: Number(raw?.totalPages ?? 0),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (isNotFoundOrForbidden(message)) {
        try {
          const fallbackResponse = await httpClient.get<ApiEnvelope<AdminUsersPagedResult>>('/Users', {
            params: { page, pageSize },
          });

          const raw = unwrap(fallbackResponse) as AdminUsersPagedResult;
          return {
            items: raw?.items ?? [],
            totalCount: Number(raw?.totalCount ?? 0),
            page: Number(raw?.page ?? page),
            pageSize: Number(raw?.pageSize ?? pageSize),
            totalPages: Number(raw?.totalPages ?? 0),
          };
        } catch {
          // Continue to final fallback below.
        }
      }

      const overviewResponse = await httpClient.get<ApiEnvelope<AdminDashboardData>>('/AdminDashboard/overview');
      const overview = unwrap(overviewResponse) as AdminDashboardData;
      return {
        items: Array.isArray(overview?.recentUsers) ? overview.recentUsers : [],
        totalCount: Number(overview?.totals?.users ?? 0),
        page: 1,
        pageSize,
        totalPages: 1,
      };
    }
  },

  async getUserById(userId: string): Promise<AdminUserDetail> {
    const response = await httpClient.get<ApiEnvelope<AdminUserDetail>>(`/Users/${userId}`);
    return unwrap(response) as AdminUserDetail;
  },

  async createUser(payload: CreateUserPayload): Promise<void> {
    const { roleName, ...createPayload } = payload;
    const response = await httpClient.post<ApiEnvelope<AdminUserDetail>>('/Users', createPayload);
    const created = unwrap(response) as AdminUserDetail;

    if (roleName && created?.id) {
      await this.setUserRole(created.id, { roleName });
    }
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<void> {
    await httpClient.put<ApiEnvelope<AdminUserDetail>>(`/Users/${userId}`, payload);
  },

  async setUserRole(userId: string, payload: SetUserRolePayload): Promise<void> {
    await httpClient.put<ApiEnvelope<AdminUserDetail>>(`/Users/${userId}/role`, payload);
  },

  async deleteUser(userId: string): Promise<void> {
    await httpClient.delete<ApiEnvelope<boolean>>(`/Users/${userId}`);
  },

  async createVoucher(payload: CreateVoucherPayload): Promise<void> {
    await httpClient.post<ApiEnvelope<string>>('/AdminDashboard/vouchers', payload);
  },

  async updateVoucher(voucherId: string, payload: UpdateVoucherPayload): Promise<void> {
    await httpClient.put<ApiEnvelope<string>>(`/AdminDashboard/vouchers/${voucherId}`, payload);
  },

  async toggleVoucher(voucherId: string): Promise<void> {
    await httpClient.patch<ApiEnvelope<string>>(`/AdminDashboard/vouchers/${voucherId}/toggle`);
  },
};

export default AdminDashboardService;