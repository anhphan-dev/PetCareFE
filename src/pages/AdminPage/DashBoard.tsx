import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Box,
  ChevronRight,
  Clock3,
  Loader2,
  LayoutDashboard,
  LogOut,
  PawPrint,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardService, {
  AdminDashboardData,
  AdminProductSummary,
  AdminUserSummary,
  AdminVoucherSummary,
} from '../../services/AdminDashboardService';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Users, label: 'Khách hàng', path: '/admin/khach-hang' },
  { icon: Box, label: 'Sản phẩm', path: '/admin/san-pham' },
  { icon: TicketPercent, label: 'Voucher', path: '/admin/vouchers' },
  { icon: Settings, label: 'Cài đặt', path: '/admin/cai-dat' },
];

const formatCompactDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatCurrencyVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const normalizeRole = (roleName?: string | null) => roleName?.trim().toLowerCase() ?? '';

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className={`absolute inset-x-0 top-0 h-1.5 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} bg-opacity-10 text-slate-900`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/60 bg-white/88 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function UserRow({ user }: { user: AdminUserSummary }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-slate-600">{user.roleName || 'User'}</p>
        <p className="text-xs text-slate-400">{formatCompactDate(user.createdAt)}</p>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: AdminProductSummary }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{product.productName}</p>
          <p className="truncate text-xs text-slate-500">{product.categoryName || 'Chưa phân loại'}</p>
        </div>
        <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-700">
          Còn {product.stockQuantity}
        </div>
      </div>
    </div>
  );
}

function VoucherRow({ voucher }: { voucher: AdminVoucherSummary }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{voucher.code}</p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{voucher.name}</p>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${voucher.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
          {voucher.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : formatCurrencyVnd(voucher.discountValue)}
        </span>
        <span>{voucher.usedCount}{voucher.usageLimit ? `/${voucher.usageLimit}` : ''} lượt</span>
      </div>
    </div>
  );
}

export default function DashBoard() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleName = normalizeRole(user?.roleName);
  const canViewAdmin = isLoggedIn && roleName === 'admin';

  const heroSummary = useMemo(() => {
    if (!dashboardData) {
      return 'Đang kết nối dữ liệu quản trị từ hệ thống PettSuba.';
    }

    return `Hiện có ${dashboardData.totals.users} người dùng, ${dashboardData.totals.products} sản phẩm và ${dashboardData.totals.activeVouchers} voucher đang hoạt động.`;
  }, [dashboardData]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { replace: true, state: { from: '/admin' } });
      return;
    }

    if (roleName && roleName !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, roleName]);

  useEffect(() => {
    if (!canViewAdmin) {
      return;
    }

    const loadDashboard = async (isManualRefresh = false) => {
      try {
        setError(null);
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const overview = await AdminDashboardService.getOverview();
        setDashboardData(overview);
      } catch (loadError: unknown) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Không thể tải dữ liệu dashboard quản trị.';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    void loadDashboard();
  }, [canViewAdmin]);

  const handleRefresh = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const overview = await AdminDashboardService.getOverview();
      setDashboardData(overview);
    } catch (loadError: unknown) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Không thể làm mới dữ liệu dashboard.';
      setError(message);
    } finally {
      setRefreshing(false);
    }
  };

  if (!canViewAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
      </div>
    );
  }

  const totals = dashboardData?.totals;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_22%),linear-gradient(180deg,#f7fbff_0%,#eef6f7_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/60 bg-slate-950 px-5 py-6 text-white shadow-[24px_0_80px_rgba(15,23,42,0.18)] lg:flex lg:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300">
                <PawPrint className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-200/70">Admin Panel</p>
                <p className="mt-1 text-xl font-black tracking-tight">PettSuba Control</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trạng thái</p>
              <p className="mt-2 font-semibold text-white">Đã kết nối các module người dùng, sản phẩm và nội dung.</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.14)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Phiên quản trị an toàn</p>
                <p className="text-xs text-slate-400">Quyền hiện tại: {user?.roleName || 'Admin'}</p>
              </div>
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Về trang chủ
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-auto">
          <header className="border-b border-white/60 bg-white/65 px-5 py-5 backdrop-blur xl:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live overview
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 xl:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 xl:text-base">
                  {heroSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hôm nay</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Làm mới
                </button>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 xl:px-8 xl:py-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Không thể tải dữ liệu quản trị</p>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-white/60 bg-white/70 backdrop-blur">
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  <span className="text-sm font-medium">Đang đồng bộ dashboard quản trị...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <StatCard
                    label="Người dùng"
                    value={String(totals?.users ?? 0)}
                    detail={`+${totals?.newUsersThisMonth ?? 0} người dùng mới trong tháng này`}
                    icon={Users}
                    accent="bg-teal-500"
                  />
                  <StatCard
                    label="Sản phẩm đang bán"
                    value={String(totals?.activeProducts ?? 0)}
                    detail={`${totals?.lowStockProducts ?? 0} sản phẩm sắp hết hàng`}
                    icon={Box}
                    accent="bg-orange-500"
                  />
                  <StatCard
                    label="Doanh thu đã ghi nhận"
                    value={formatCurrencyVnd(totals?.totalRevenue ?? 0)}
                    detail={`Tháng này ${formatCurrencyVnd(totals?.revenueThisMonth ?? 0)} từ ${totals?.paidOrders ?? 0}/${totals?.totalOrders ?? 0} đơn`}
                    icon={TrendingUp}
                    accent="bg-emerald-500"
                  />
                  <StatCard
                    label="Voucher"
                    value={String(totals?.activeVouchers ?? 0)}
                    detail={`${totals?.expiringVouchers ?? 0} voucher sắp hết hạn trong 7 ngày`}
                    icon={TicketPercent}
                    accent="bg-indigo-500"
                  />
                </section>

                <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.35fr_0.95fr]">
                  <SectionShell
                    title="Bức tranh vận hành"
                    subtitle="Tổng hợp nhanh các module đang kết nối được từ backend hiện tại"
                    action={
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Dữ liệu live
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f766e,#14b8a6)] p-5 text-white shadow-[0_20px_50px_rgba(20,184,166,0.28)]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Users</p>
                          <Users className="h-5 w-5 text-white/80" />
                        </div>
                        <p className="mt-6 text-4xl font-black">{totals?.users ?? 0}</p>
                        <p className="mt-3 text-sm text-white/80">Quản trị người dùng và vai trò đã có API sẵn.</p>
                      </div>

                      <div className="rounded-[26px] bg-[linear-gradient(135deg,#1e293b,#334155)] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Products</p>
                          <BarChart3 className="h-5 w-5 text-white/80" />
                        </div>
                        <p className="mt-6 text-4xl font-black">{totals?.products ?? 0}</p>
                        <p className="mt-3 text-sm text-white/80">Sản phẩm, tồn kho và nội dung hình ảnh đã có thể theo dõi.</p>
                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tài khoản kích hoạt</p>
                        <p className="mt-2 text-2xl font-black text-slate-950">{totals?.activeUsers ?? 0}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cảnh báo tồn kho</p>
                        <p className="mt-2 text-2xl font-black text-slate-950">{totals?.lowStockProducts ?? 0}</p>
                      </div>
                    </div>
                  </SectionShell>

                  <SectionShell
                    title="Lộ trình mở rộng"
                    subtitle="Các phần nên nối backend tiếp theo để hoàn thiện admin suite"
                  >
                    <div className="space-y-3">
                      {[
                        'Thêm bảng quản trị đơn hàng để theo dõi checkout và thanh toán PayOS.',
                        'Bổ sung endpoint dashboard tổng hợp cho biến động đơn hàng theo ngày/tuần.',
                        'Bổ sung route bảo vệ frontend cho toàn bộ các trang /admin/*.',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                          <p className="text-sm leading-6 text-slate-600">{item}</p>
                        </div>
                      ))}
                    </div>
                  </SectionShell>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <SectionShell
                    title="Người dùng mới nhất"
                    subtitle="Danh sách người dùng mới trong tập dữ liệu quản trị vừa tải"
                    action={
                      <Link
                        to="/admin/khach-hang"
                        className="text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
                      >
                        Xem tất cả
                      </Link>
                    }
                  >
                    <div className="space-y-3">
                      {(dashboardData?.recentUsers ?? []).map((dashboardUser) => (
                        <UserRow key={dashboardUser.id} user={dashboardUser} />
                      ))}
                    </div>
                  </SectionShell>

                  <SectionShell
                    title="Sản phẩm cần chú ý"
                    subtitle="Tồn kho thấp cần được bổ sung sớm"
                    action={<Clock3 className="h-4 w-4 text-slate-400" />}
                  >
                    <div className="space-y-3">
                      {(dashboardData?.lowStockProducts ?? []).length > 0 ? (
                        (dashboardData?.lowStockProducts ?? []).map((product) => (
                          <ProductRow key={product.id} product={product} />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
                          Hiện chưa có sản phẩm nào rơi vào ngưỡng tồn kho thấp.
                        </div>
                      )}
                    </div>
                  </SectionShell>
                </section>

                <section className="grid grid-cols-1 gap-6">
                  <SectionShell
                    title="Voucher hiệu quả"
                    subtitle="Top voucher theo số lượt sử dụng"
                    action={
                      <Link
                        to="/admin/vouchers"
                        className="text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
                      >
                        Quản lý voucher
                      </Link>
                    }
                  >
                    <div className="space-y-3">
                      {(dashboardData?.topVouchers ?? []).length > 0 ? (
                        (dashboardData?.topVouchers ?? []).map((voucher) => (
                          <VoucherRow key={voucher.id} voucher={voucher} />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          Chưa có voucher nào trong hệ thống.
                        </div>
                      )}
                    </div>
                  </SectionShell>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
