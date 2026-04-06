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
            {/* TRANG CHỦ */}
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

            <Link to="/thu-cung" className="text-sm font-medium text-gray-700 hover:text-teal-600">
              THÚ CƯNG
            </Link>

            <Link to="/dat-lich" className="text-sm font-medium text-gray-700 hover:text-teal-600">
              DỊCH VỤ
            </Link>

            <Link to="/cua-hang" className="text-sm font-medium text-gray-700 hover:text-teal-600">
              CỬA HÀNG
            </Link>

            <Link to="/membership" className="text-sm font-medium text-gray-700 hover:text-teal-600 inline-flex items-center gap-1">
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
                  className="flex items-center gap-2 rounded-full"
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Icon className="w-4 h-4 text-gray-400" />
                          {item.label}
                        </Link>
                      );
                    })}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/dang-nhap" className="text-sm font-medium text-teal-600">
                ĐĂNG NHẬP
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}