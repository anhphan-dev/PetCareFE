import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  PawPrint,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
  { icon: Users, label: 'Khách hàng', path: '/admin/khach-hang' },
  { icon: Calendar, label: 'Lịch hẹn', path: '/admin/lich-hen' },
  { icon: FileText, label: 'Tin tức', path: '/admin/tin-tuc' },
  { icon: Settings, label: 'Cài đặt', path: '/admin/cai-dat' },
];

const stats = [
  { label: 'Lịch hẹn hôm nay', value: '12', color: 'bg-teal-500' },
  { label: 'Khách hàng mới', value: '8', color: 'bg-orange-500' },
  { label: 'Doanh thu tháng', value: '45.2M', color: 'bg-teal-600' },
];

export default function DashBoard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">VetCare Admin</span>
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
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-gray-500 text-sm">Quản lý phòng khám thú y VetCare</p>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.color} rounded-xl p-6 text-white shadow-md`}
              >
                <p className="text-white/90 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch hẹn gần đây</h2>
            <div className="text-gray-500 text-center py-8">
              Chưa có dữ liệu. Kết nối API để xem lịch hẹn.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
