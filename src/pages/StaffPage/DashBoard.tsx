import { Calendar, LayoutDashboard, LogOut, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
  { icon: Calendar, label: 'Lịch hẹn hôm nay', path: '/staff/lich-hen' },
  { icon: PawPrint, label: 'Thú cưng đang chăm sóc', path: '/staff/thu-cung' },
];

const stats = [
  { label: 'Lịch hẹn hôm nay', value: '5', color: 'bg-teal-500' },
  { label: 'Hoàn thành tuần này', value: '18', color: 'bg-purple-500' },
];

export default function StaffDashBoard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <PawPrint className="w-8 h-8 text-teal-600" />
          <span className="text-xl font-bold text-teal-700">Staff Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100">
            <LogOut className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b px-8 py-4">
          <h1 className="text-2xl font-bold">Tổng quan nhân viên</h1>
        </header>
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className={`${stat.color} rounded-xl p-6 text-white shadow-md`}>
                <p className="text-white/90 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Lịch hẹn sắp tới</h2>
            {/* Kết nối API ở đây */}
            <p className="text-gray-500 text-center py-8">Chưa có lịch hẹn nào hôm nay</p>
          </div>
        </main>
      </div>
    </div>
  );
}