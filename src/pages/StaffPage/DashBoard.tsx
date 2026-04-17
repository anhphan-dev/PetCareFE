import {
  Box,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  LogOut,
  PackageSearch,
  PawPrint,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../../services/httpClient';

const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/staff/them-san-pham' },
  { icon: PackageSearch, label: 'Quản lý sản phẩm', path: '/staff/quan-li-san-pham' },
];

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type ProductListPayload = {
  items?: ProductSummary[];
  totalCount?: number;
};

type ProductSummary = {
  id: string;
  productName: string;
  stockQuantity: number;
  price: number;
  isActive: boolean;
  categoryName?: string | null;
};

const unwrap = <T,>(response: T | ApiEnvelope<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiEnvelope<T>)) {
    return ((response as ApiEnvelope<T>).data as T) ?? (response as T);
  }
  return response as T;
};

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 ${className}`}>
    {children}
  </div>
);

export default function StaffDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchCount = async (extraParams: Record<string, string | number | boolean> = {}) => {
      const baseParams = { page: 1, pageSize: 1, ...extraParams };

      try {
        const response = await httpClient.get<ApiEnvelope<ProductListPayload>>('/Products', {
          params: { includeInactive: true, ...baseParams },
        });
        const raw = unwrap(response);
        return Number(raw?.totalCount ?? 0);
      } catch {
        const fallback = await httpClient.get<ApiEnvelope<ProductListPayload>>('/Products', {
          params: baseParams,
        });
        const raw = unwrap(fallback);
        return Number(raw?.totalCount ?? 0);
      }
    };

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const recentResponse = await httpClient.get<ApiEnvelope<ProductListPayload>>('/Products', {
          params: { page: 1, pageSize: 5, includeInactive: true },
        });

        const recentRaw = unwrap(recentResponse);
        const recentItems = Array.isArray(recentRaw?.items) ? recentRaw.items : [];

        setProducts(recentItems);
        setTotalCount(await fetchCount());
        setActiveCount(await fetchCount({ isActive: true }));
        setInactiveCount(await fetchCount({ isActive: false }));
      } catch {
        const fallback = await httpClient.get<ApiEnvelope<ProductListPayload>>('/Products', {
          params: { page: 1, pageSize: 5 },
        });

        const raw = unwrap(fallback);
        const items = Array.isArray(raw?.items) ? raw.items : [];
        const total = Number(raw?.totalCount ?? items.length);

        setProducts(items);
        setTotalCount(total);
        setActiveCount(total);
        setInactiveCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const lowStockCount = useMemo(() => products.filter((item) => Number(item.stockQuantity ?? 0) <= 0).length, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <aside className="w-64 bg-white/90 backdrop-blur-sm shadow-sm border-r border-gray-200 flex flex-col fixed h-full z-40">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">Staff Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {staffMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/staff';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tổng quan nhân viên sản phẩm</h1>
              <p className="text-gray-500 text-sm">Theo dõi và quản lý kho sản phẩm</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/staff/them-san-pham"
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <p className="text-sm text-gray-500">Tổng sản phẩm</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">{loading ? '...' : totalCount}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{loading ? '...' : activeCount}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-sm text-gray-500">Ngừng hoạt động</p>
              <p className="mt-2 text-3xl font-bold text-rose-600">{loading ? '...' : inactiveCount}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-sm text-gray-500">Hết hàng (top 5)</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{loading ? '...' : lowStockCount}</p>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Box className="w-5 h-5 text-teal-600" />
                Sản phẩm gần đây
              </h2>
              <Link to="/staff/quan-li-san-pham" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Đang tải dữ liệu sản phẩm...
              </div>
            ) : products.length === 0 ? (
              <div className="text-gray-500 text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                Chưa có sản phẩm nào để hiển thị.
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.categoryName || 'Chưa phân loại'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Kho: {item.stockQuantity}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/staff/them-san-pham"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm sản phẩm
              </Link>
              <Link
                to="/staff/quan-li-san-pham"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <PackageSearch className="w-5 h-5" />
                Quản lý sản phẩm
              </Link>
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}