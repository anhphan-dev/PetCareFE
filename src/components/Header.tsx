import { PawPrint, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const menuItems: { label: string; path: string }[] = [
  { label: 'TRANG CHỦ', path: '/' },
  { label: 'GIỚI THIỆU', path: '/gioi-thieu' },
  { label: 'DỊCH VỤ', path: '/dich-vu' },
  { label: 'TIN TỨC', path: '/tin-tuc' },
  { label: 'LIÊN HỆ', path: '/lien-he' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-700">VetCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/dat-lich')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              ĐẶT LỊCH
            </button>
            <Link
              to="/dang-nhap"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              ĐĂNG NHẬP
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/dat-lich');
              }}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              ĐẶT LỊCH
            </button>
            <Link
              to="/dang-nhap"
              className="block py-2 text-sm font-medium text-teal-600"
              onClick={() => setIsMenuOpen(false)}
            >
              ĐĂNG NHẬP
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
