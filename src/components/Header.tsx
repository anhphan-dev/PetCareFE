import {
  ChevronDown,
  Crown,
  Dog,
  Heart,
  Home,
  List,
  LogOut,
  Menu,
  PawPrint,
  ShoppingBag,
  Sparkles,
  User,
  UserCircle,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropdown } from '../hooks/useDropdown';
import { getImageUrl } from '../utils/imageUtils';

const homeDropdownItems = [
  { label: 'Giới thiệu', path: '/gioi-thieu', icon: Home },
  { label: 'Tin tức', path: '/tin-tuc', icon: List },
  { label: 'Liên hệ', path: '/lien-he', icon: Heart },
];

const userMenuItems = [
  { icon: UserCircle, label: 'Hồ sơ của tôi', path: '/tai-khoan' },
  { icon: Crown, label: 'Gói thành viên', path: '/membership' },
  { icon: Sparkles, label: 'AI Sức khỏe', path: '/ai-suc-khoe' },
  // { icon: Briefcase, label: 'Dịch vụ đã đặt', path: '/tai-khoan/dich-vu' },
  { icon: Dog, label: 'Thú cưng của tôi', path: '/thu-cung' },
  { icon: ShoppingBag, label: 'Giỏ hàng của bạn', path: '/gio-hang' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const homeDropdown = useDropdown();
  const userDropdown = useDropdown();
  const [isHomeDropdownOpenMobile, setIsHomeDropdownOpenMobile] = useState(false);
  const [isUserDropdownOpenMobile, setIsUserDropdownOpenMobile] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        homeDropdown.close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [homeDropdown]);

  const handleLogout = () => {
    logout();
    userDropdown.close();
    setIsUserDropdownOpenMobile(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeAllMobile = () => {
    setIsMenuOpen(false);
    setIsHomeDropdownOpenMobile(false);
    setIsUserDropdownOpenMobile(false);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-700">PetCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" ref={navDropdownRef}>
            {/* TRANG CHỦ (vẫn giữ dropdown) */}
            <div 
              className="relative"
              onMouseEnter={() => homeDropdown.open()}
            >
              <button
                onClick={() => homeDropdown.toggle()}
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors inline-flex items-center gap-1"
              >
                TRANG CHỦ <ChevronDown className="w-4 h-4" />
              </button>
              {homeDropdown.isOpen && (
                <div 
                  className="absolute left-0 mt-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  onMouseEnter={() => homeDropdown.open()}
                  onMouseLeave={() => homeDropdown.closeWithDelay()}
                >
                  {homeDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => homeDropdown.close()}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* THÚ CƯNG */}
            <Link
              to="/thu-cung"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
            >
              THÚ CƯNG
            </Link>

            {/* DỊCH VỤ - bỏ dropdown, chuyển thành link trực tiếp */}
            <Link
              to="/dat-lich"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
            >
              DỊCH VỤ
            </Link>

            {/* CỬA HÀNG - bỏ dropdown, chuyển thành link trực tiếp */}
            <Link
              to="/cua-hang"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
            >
              CỬA HÀNG
            </Link>

            {/* THÀNH VIÊN */}
            <Link
              to="/membership"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors inline-flex items-center gap-1"
            >
              <Crown className="w-4 h-4" />
              THÀNH VIÊN
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/dat-lich')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              ĐẶT LỊCH
            </button>

            {isLoggedIn && user ? (
              <div 
                className="relative"
                onMouseEnter={() => userDropdown.open()}
                onMouseLeave={() => userDropdown.closeWithDelay()}
              >
                <button
                  onClick={() => userDropdown.toggle()}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-expanded={userDropdown.isOpen}
                  aria-haspopup="true"
                >
                  {user.avatarUrl ? (
                    <img
                      src={getImageUrl(user.avatarUrl)}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-teal-100"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <User className="w-5 h-5" />
                    </span>
                  )}
                </button>

                {userDropdown.isOpen && (
                  <div 
                    className="absolute right-0 mt-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    onMouseEnter={() => userDropdown.open()}
                    onMouseLeave={() => userDropdown.closeWithDelay()}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => userDropdown.close()}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-gray-400" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/dang-nhap"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                ĐĂNG NHẬP
              </Link>
            )}
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
            {/* TRANG CHỦ (giữ dropdown) */}
            <button
              onClick={() => setIsHomeDropdownOpenMobile((o) => !o)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700"
            >
              <span>TRANG CHỦ</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isHomeDropdownOpenMobile ? 'rotate-180' : ''}`} />
            </button>
            {isHomeDropdownOpenMobile && (
              <div className="pl-4">
                {homeDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block py-2 text-sm text-gray-600 hover:text-teal-600"
                    onClick={closeAllMobile}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* THÚ CƯNG */}
            <Link
              to="/thu-cung"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
              onClick={closeAllMobile}
            >
              THÚ CƯNG
            </Link>

            {/* DỊCH VỤ - không dropdown */}
            <Link
              to="/dat-lich"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
              onClick={closeAllMobile}
            >
              DỊCH VỤ
            </Link>

            {/* CỬA HÀNG - không dropdown */}
            <Link
              to="/cua-hang"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
              onClick={closeAllMobile}
            >
              CỬA HÀNG
            </Link>

            {/* THÀNH VIÊN */}
            <Link
              to="/membership"
              className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-teal-600"
              onClick={closeAllMobile}
            >
              <Crown className="w-4 h-4" />
              THÀNH VIÊN
            </Link>

            <button
              onClick={() => {
                closeAllMobile();
                navigate('/dat-lich');
              }}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              ĐẶT LỊCH
            </button>

            {isLoggedIn && user ? (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsUserDropdownOpenMobile((o) => !o)}
                  className="flex items-center gap-3 w-full py-2 text-sm font-medium text-gray-700"
                >
                  {user.avatarUrl ? (
                    <img
                      src={getImageUrl(user.avatarUrl)}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <User className="w-4 h-4" />
                    </span>
                  )}
                  <span>{user.fullName}</span>
                </button>
                {isUserDropdownOpenMobile && (
                  <div className="pl-4 space-y-0">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeAllMobile}
                          className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-teal-600"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 text-sm text-red-600 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/dang-nhap"
                className="block py-2 text-sm font-medium text-teal-600"
                onClick={closeAllMobile}
              >
                ĐĂNG NHẬP
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}