// src/pages/StaffPage/DashboardPage.tsx
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  PackageSearch,
  PawPrint,
  PlusCircle,
  Scissors,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ============ STAFF MENU (Minimal - Only requested routes) ============
const staffMenuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  { icon: Calendar, label: 'Lịch đặt dịch vụ', path: '/staff/lich-dat' },
  { icon: Scissors, label: 'Dịch vụ của tôi', path: '/staff/dich-vu' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/staff/them-san-pham' },
  { icon: PackageSearch, label: 'Quản lý sản phẩm', path: '/staff/quan-li-san-pham' },
];

// ============ STATS DATA ============
const stats = [
  { 
    label: 'Lịch đặt hôm nay', 
    value: '6', 
    icon: Calendar,
    color: 'bg-teal-500',
    trend: '+2 so với hôm qua',
    trendUp: true
  },
  { 
    label: 'Đánh giá trung bình', 
    value: '4.7', 
    icon: Star,
    color: 'bg-amber-500',
    trend: '+0.3 tháng này',
    trendUp: true
  },
  { 
    label: 'Doanh thu tháng', 
    value: '32.8M', 
    icon: DollarSign,
    color: 'bg-purple-600',
    trend: '+12.5%',
    trendUp: true
  },
  { 
    label: 'Tỷ lệ hoàn thành', 
    value: '95%', 
    icon: CheckCircle2,
    color: 'bg-emerald-600',
    trend: '+3%',
    trendUp: true
  },
];

// ============ COMPONENT: GlassCard ============
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 ${className}`}>
    {children}
  </div>
);

// ============ COMPONENT: StatCard ============
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color,
  trend,
  trendUp 
}) => (
  <GlassCard className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </p>
        )}
      </div>
      <div className={`${color} p-3 rounded-lg text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </GlassCard>
);

// ============ MAIN COMPONENT ============
export default function StaffDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 
                         hover:bg-teal-50 hover:text-teal-700 transition-all ${
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 
                     hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
              <p className="text-gray-500 text-sm">Quản lý dịch vụ, lịch đặt và sản phẩm</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/staff/them-san-pham"
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 
                         text-white rounded-lg font-medium transition-colors shadow-sm 
                         hover:shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                Thêm sản phẩm
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
                trendUp={stat.trendUp}
              />
            ))}
          </div>

          {/* Recent Bookings Section */}
          <GlassCard className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Lịch đặt dịch vụ gần đây
              </h2>
              <Link
                to="/staff/lich-dat"
                className="text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Chưa có lịch đặt nào. Kết nối API để hiển thị dữ liệu.</p>
            </div>
          </GlassCard>

          {/* Additional Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Section */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-teal-600" />
                  Dịch vụ của tôi
                </h2>
                <Link
                  to="/staff/dich-vu"
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Quản lý →
                </Link>
              </div>
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Scissors className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có dịch vụ nào</p>
              </div>
            </GlassCard>

            {/* Products Section */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600" />
                  Sản phẩm gần đây
                </h2>
                <Link
                  to="/staff/quan-li-san-pham"
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <PackageSearch className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có sản phẩm nào</p>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <GlassCard className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Thêm sản phẩm', path: '/staff/them-san-pham', icon: PlusCircle, color: 'bg-teal-500' },
                { label: 'Quản lý sản phẩm', path: '/staff/quan-li-san-pham', icon: PackageSearch, color: 'bg-blue-500' },
                { label: 'Lịch đặt', path: '/staff/lich-dat', icon: Calendar, color: 'bg-purple-500' },
                { label: 'Dịch vụ', path: '/staff/dich-vu', icon: Scissors, color: 'bg-amber-500' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl 
                             bg-gray-50 hover:bg-white hover:shadow-md transition-all 
                             border border-gray-100 group"
                  >
                    <div className={`${action.color} p-3 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}