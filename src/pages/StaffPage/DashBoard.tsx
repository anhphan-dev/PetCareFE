// src/pages/ProviderPage/DashBoard.tsx
import {
  Calendar,
  DollarSign,
  Hotel,
  LayoutDashboard,
  LogOut,
  PawPrint,
  PlusCircle,
  Scissors,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  { icon: Calendar, label: 'Lịch đặt dịch vụ', path: '/staff/lich-dat' },
  { icon: Scissors, label: 'Dịch vụ của tôi', path: '/staff/dich-vu' },
  { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/staff/them-san-pham' },  // ← thêm dòng này
  { icon: Hotel, label: 'Phòng / Khu vực', path: '/staff/phong-khu-vuc' },
  { icon: Star, label: 'Đánh giá & Phản hồi', path: '/staff/danh-gia' },
  { icon: DollarSign, label: 'Doanh thu & Thanh toán', path: '/staff/doanh-thu' },
  { icon: Users, label: 'Khách hàng của tôi', path: '/staff/khach-hang' },
];

const stats = [
  { label: 'Lịch đặt hôm nay', value: '6', color: 'bg-teal-500' },
  { label: 'Đánh giá trung bình', value: '4.7', color: 'bg-amber-500' },
  { label: 'Doanh thu tháng này', value: '32.8M', color: 'bg-purple-600' },
  { label: 'Tỷ lệ hoàn thành', value: '95%', color: 'bg-emerald-600' },
];

export default function ProviderDashBoard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">Provider Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan nhà cung cấp</h1>
          <p className="text-gray-500 text-sm">Quản lý dịch vụ, lịch đặt và doanh thu của bạn tại VetCare</p>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.color} rounded-xl p-6 text-white shadow-md`}
              >
                <p className="text-white/90 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch đặt dịch vụ gần đây</h2>
            <div className="text-gray-500 text-center py-12">
              Chưa có lịch đặt nào. Kết nối API để hiển thị lịch đặt dịch vụ của bạn.
            </div>
          </div>

          {/* Có thể thêm section khác nếu muốn */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Đánh giá mới nhất</h2>
              <div className="text-gray-500 text-center py-8">
                Chưa có đánh giá. Kết nối API để xem phản hồi từ khách hàng.
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Doanh thu gần đây</h2>
              <div className="text-gray-500 text-center py-8">
                Chưa có dữ liệu doanh thu. Kết nối API để theo dõi thu nhập.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}