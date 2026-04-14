// Header.tsx
import {
  ChevronDown, Crown, Dog, Heart, Home, List, LogOut,
  Menu, PawPrint,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles, User, UserCircle,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useDropdown } from '../hooks/useDropdown';
import { getImageUrl } from '../utils/imageUtils';
import { getAppointmentBadgeCount } from '../utils/appointmentBadgeStorage';
import styles from './Header.module.css';

const homeDropdownItems = [
  { label: 'Giới thiệu', path: '/gioi-thieu', icon: Home },
  { label: 'Tin tức', path: '/tin-tuc', icon: List },
  { label: 'Liên hệ', path: '/lien-he', icon: Heart },
];

const userMenuItems = [
  { icon: UserCircle, label: 'Hồ sơ của tôi', path: '/tai-khoan' },
  { icon: Crown,      label: 'Gói thành viên', path: '/membership' },
  { icon: Sparkles,   label: 'AI Sức khỏe',   path: '/ai-suc-khoe' },
  { icon: Dog,        label: 'Thú cưng của tôi', path: '/thu-cung' },
  { icon: ShoppingBag, label: 'Giỏ hàng',     path: '/gio-hang' },
];

const navLinks = [
  { label: 'Trang chủ', path: '/',         hasDropdown: true },
  { label: 'Cửa hàng',  path: '/cua-hang', hasDropdown: false },
  { label: 'Dịch vụ',   path: '/dat-lich', hasDropdown: false },
  { label: 'Thú cưng',  path: '/thu-cung', hasDropdown: false },
  { label: 'Thành viên', path: '/membership', hasDropdown: false, icon: Crown },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchVal, setSearchVal]     = useState('');
  const [mobileHomeOpen, setMobileHomeOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [appointmentBadge, setAppointmentBadge] = useState(0);

  const homeDropdown = useDropdown();
  const userDropdown = useDropdown();
  const navRef       = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  const navigate    = useNavigate();
  const location    = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();

  /* scroll → glass effect */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const syncBadge = () => setAppointmentBadge(getAppointmentBadgeCount());
    syncBadge();
    window.addEventListener('petcare-appointment-badge-change', syncBadge);
    window.addEventListener('storage', syncBadge);
    return () => {
      window.removeEventListener('petcare-appointment-badge-change', syncBadge);
      window.removeEventListener('storage', syncBadge);
    };
  }, [user?.id]);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        homeDropdown.close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [homeDropdown]);

  /* focus search input when opened */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    userDropdown.close();
    setMobileUserOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeAllMobile = () => {
    setIsMenuOpen(false);
    setMobileHomeOpen(false);
    setMobileUserOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/cua-hang?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.inner}>
        {/* ── Logo ── */}
        <Link to="/" className={styles.logo}>
          <PawPrint className={styles.logoIcon} />
          <span className={styles.logoText}>PetSuba</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className={styles.desktopNav} ref={navRef} aria-label="Điều hướng chính">
          {navLinks.map((link) => (
            link.hasDropdown ? (
              <div
                key={link.path}
                className={styles.navItemWrapper}
                onMouseEnter={() => homeDropdown.open()}
                onMouseLeave={() => homeDropdown.closeWithDelay()}
              >
                <button
                  className={`${styles.navLink} ${isActive(link.path) ? styles.navLinkActive : ''}`}
                  onClick={() => homeDropdown.toggle()}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`${styles.chevron} ${homeDropdown.isOpen ? styles.chevronOpen : ''}`}
                  />
                </button>

                {homeDropdown.isOpen && (
                  <div
                    className={styles.dropdown}
                    onMouseEnter={() => homeDropdown.open()}
                    onMouseLeave={() => homeDropdown.closeWithDelay()}
                  >
                    {homeDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={styles.dropdownItem}
                          onClick={() => homeDropdown.close()}
                        >
                          <Icon size={15} className={styles.dropdownIcon} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${isActive(link.path) ? styles.navLinkActive : ''}`}
              >
                {link.icon && <link.icon size={14} className={styles.navIcon} />}
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className={styles.desktopActions}>
          {/* Search */}
          <div className={`${styles.searchWrapper} ${searchOpen ? styles.searchOpen : ''}`}>
            {searchOpen && (
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className={styles.searchInput}
                  aria-label="Tìm kiếm sản phẩm"
                />
              </form>
            )}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Tìm kiếm"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Cart */}
          <Link to="/gio-hang" className={styles.cartBtn} aria-label="Giỏ hàng">
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>

          {/* Book CTA */}
          <button
            className={styles.ctaBtn}
            onClick={() => navigate('/dat-lich')}
          >
            Đặt lịch
          </button>

          {/* User */}
          {isLoggedIn && user ? (
            <div
              className={styles.userWrapper}
              onMouseEnter={() => userDropdown.open()}
              onMouseLeave={() => userDropdown.closeWithDelay()}
            >
              <button
                className={styles.avatarBtn}
                onClick={() => userDropdown.toggle()}
                aria-expanded={userDropdown.isOpen}
                aria-haspopup="true"
                aria-label="Tài khoản"
              >
                {user.avatarUrl ? (
                  <img
                    src={getImageUrl(user.avatarUrl)}
                    alt={user.fullName}
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    <User size={17} />
                  </span>
                )}
                <span className={styles.avatarOnline} />
                {appointmentBadge > 0 && (
                  <span className={styles.appointmentBadge} aria-label={`${appointmentBadge} lịch mới`}>
                    {appointmentBadge > 9 ? '9+' : appointmentBadge}
                  </span>
                )}
              </button>

              {userDropdown.isOpen && (
                <div
                  className={styles.userDropdown}
                  onMouseEnter={() => userDropdown.open()}
                  onMouseLeave={() => userDropdown.closeWithDelay()}
                >
                  <div className={styles.userDropdownHeader}>
                    <p className={styles.userDropdownName}>{user.fullName}</p>
                    <p className={styles.userDropdownEmail}>{user.email}</p>
                  </div>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={styles.dropdownItem}
                        onClick={() => userDropdown.close()}
                      >
                        <Icon size={15} className={styles.dropdownIcon} />
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className={styles.dropdownDivider} />
                  <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/dang-nhap" className={styles.loginLink}>Đăng nhập</Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ════ Mobile drawer ════ */}
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerInner}>
          {/* Trang chủ + dropdown */}
          <div className={styles.mobileGroup}>
            <button
              className={styles.mobileLinkToggle}
              onClick={() => setMobileHomeOpen((v) => !v)}
            >
              Trang chủ
              <ChevronDown
                size={14}
                className={`${styles.chevron} ${mobileHomeOpen ? styles.chevronOpen : ''}`}
              />
            </button>
            {mobileHomeOpen && (
              <div className={styles.mobileSubMenu}>
                {homeDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={styles.mobileSubLink}
                    onClick={closeAllMobile}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: 'Cửa hàng', path: '/cua-hang' },
            { label: 'Dịch vụ',  path: '/dat-lich' },
            { label: 'Thú cưng', path: '/thu-cung' },
            { label: 'Thành viên', path: '/membership' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.mobileLink} ${isActive(link.path) ? styles.mobileLinkActive : ''}`}
              onClick={closeAllMobile}
            >
              {link.label}
            </Link>
          ))}

          <div className={styles.mobileDivider} />

          <button
            className={styles.mobileCta}
            onClick={() => { closeAllMobile(); navigate('/dat-lich'); }}
          >
            Đặt lịch ngay
          </button>

          {/* Mobile user */}
          {isLoggedIn && user ? (
            <div className={styles.mobileUserSection}>
              <button
                className={styles.mobileUserToggle}
                onClick={() => setMobileUserOpen((v) => !v)}
              >
                <span className={styles.mobileAvatarWrap}>
                  {user.avatarUrl ? (
                    <img src={getImageUrl(user.avatarUrl)} alt={user.fullName} className={styles.mobileAvatar} />
                  ) : (
                    <span className={styles.mobileAvatarFallback}><User size={16} /></span>
                  )}
                  {appointmentBadge > 0 && (
                    <span className={styles.mobileAppointmentBadge} aria-hidden="true">
                      {appointmentBadge > 9 ? '9+' : appointmentBadge}
                    </span>
                  )}
                </span>
                <span className={styles.mobileUserName}>{user.fullName}</span>
                <ChevronDown
                  size={14}
                  className={`${styles.chevron} ${mobileUserOpen ? styles.chevronOpen : ''}`}
                />
              </button>

              {mobileUserOpen && (
                <div className={styles.mobileSubMenu}>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={styles.mobileSubLink}
                        onClick={closeAllMobile}
                      >
                        <Icon size={14} />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button className={styles.mobileLogout} onClick={handleLogout}>
                    <LogOut size={14} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/dang-nhap" className={styles.mobileLoginLink} onClick={closeAllMobile}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div className={styles.mobileBackdrop} onClick={closeAllMobile} aria-hidden="true" />
      )}
    </header>
  );
}