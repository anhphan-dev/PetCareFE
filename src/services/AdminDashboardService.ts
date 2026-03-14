import httpClient from './httpClient';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
};

export interface AdminUserSummary {
  id: string;
  fullName: string;
  email: string;
  roleName?: string | null;
  isActive: boolean;
  createdAt: string;
}

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
  };
  recentUsers: AdminUserSummary[];
  lowStockProducts: AdminProductSummary[];
  topPosts: AdminBlogSummary[];
  latestPosts: AdminBlogSummary[];
}

type AdminRevenueSummary = {
  totalRevenue: number;
  paidRevenueThisMonth: number;
  totalOrders: number;
  paidOrders: number;
  generatedAt?: string;
};

const unwrap = <T>(response: T | ApiEnvelope<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiEnvelope<T>)) {
    return ((response as ApiEnvelope<T>).data as T) ?? (response as T);
  }

  return response as T;
};

const unwrapPaged = <T>(response: PagedResult<T> | ApiEnvelope<PagedResult<T>>): PagedResult<T> => {
  const raw = unwrap(response) as PagedResult<T>;

  return {
    items: raw?.items ?? [],
    totalCount: raw?.totalCount ?? 0,
    page: raw?.page ?? 1,
    pageSize: raw?.pageSize ?? 0,
    totalPages: raw?.totalPages ?? 0,
  };
};

const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const AdminDashboardService = {
  async getOverview(): Promise<AdminDashboardData> {
    const [usersResponse, productsResponse, activeProductsResponse, blogsResponse, revenueResponse] = await Promise.all([
      httpClient.get<ApiEnvelope<PagedResult<AdminUserSummary>> | PagedResult<AdminUserSummary>>(
        '/Users',
        { params: { page: 1, pageSize: 200 } }
      ),
      httpClient.get<ApiEnvelope<PagedResult<AdminProductSummary>> | PagedResult<AdminProductSummary>>(
        '/Products',
        { params: { page: 1, pageSize: 1 } }
      ),
      httpClient.get<ApiEnvelope<AdminProductSummary[]> | AdminProductSummary[]>('/Products/active'),
      httpClient.get<ApiEnvelope<AdminBlogSummary[]> | AdminBlogSummary[]>('/Blogs/all'),
      httpClient.get<ApiEnvelope<AdminRevenueSummary> | AdminRevenueSummary>('/AdminDashboard/revenue'),
    ]);

    const users = unwrapPaged(usersResponse);
    const products = unwrapPaged(productsResponse);
    const activeProducts = unwrap(activeProductsResponse) ?? [];
    const blogs = unwrap(blogsResponse) ?? [];
    const revenue = unwrap(revenueResponse) ?? {
      totalRevenue: 0,
      paidRevenueThisMonth: 0,
      totalOrders: 0,
      paidOrders: 0,
    };

    const activeUsers = users.items.filter((user) => user.isActive).length;
    const newUsersThisMonth = users.items.filter(
      (user) => new Date(user.createdAt) >= startOfMonth
    ).length;
    const lowStockProducts = activeProducts
      .filter((product) => product.stockQuantity <= 10)
      .sort((left, right) => left.stockQuantity - right.stockQuantity)
      .slice(0, 5);
    const publishedBlogs = blogs.filter(
      (post) => post.status.trim().toLowerCase() === 'published'
    ).length;
    const totalBlogViews = blogs.reduce((sum, post) => sum + (post.viewCount ?? 0), 0);
    const recentUsers = [...users.items]
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .slice(0, 5);
    const topPosts = [...blogs]
      .sort((left, right) => {
        const scoreLeft = (left.viewCount ?? 0) + (left.likeCount ?? 0) * 3;
        const scoreRight = (right.viewCount ?? 0) + (right.likeCount ?? 0) * 3;
        return scoreRight - scoreLeft;
      })
      .slice(0, 4);
    const latestPosts = [...blogs]
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .slice(0, 4);

    return {
      totals: {
        users: users.totalCount,
        activeUsers,
        newUsersThisMonth,
        products: products.totalCount,
        activeProducts: activeProducts.length,
        lowStockProducts: activeProducts.filter((product) => product.stockQuantity <= 10).length,
        blogs: blogs.length,
        publishedBlogs,
        totalBlogViews,
        totalRevenue: Number(revenue.totalRevenue ?? 0),
        revenueThisMonth: Number(revenue.paidRevenueThisMonth ?? 0),
        totalOrders: Number(revenue.totalOrders ?? 0),
        paidOrders: Number(revenue.paidOrders ?? 0),
      },
      recentUsers,
      lowStockProducts,
      topPosts,
      latestPosts,
    };
  },
};

export default AdminDashboardService;