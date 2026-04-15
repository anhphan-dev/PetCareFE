// Footer.tsx
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, PawPrint, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Trang chủ',  path: '/' },
  { label: 'Cửa hàng',  path: '/cua-hang' },
  { label: 'Dịch vụ',   path: '/dat-lich' },
  { label: 'Thú cưng',  path: '/thu-cung' },
  { label: 'Thành viên', path: '/membership' },
  { label: 'Tin tức',   path: '/tin-tuc' },
];

const CATEGORIES = [
  '🍖 Thức ăn',
  '🎾 Đồ chơi',
  '🧣 Phụ kiện',
  '👕 Quần áo',
  '💊 Thuốc & Vitamin',
];

export default function Footer() {
  return (
    <footer className={styles.footer} id="lien-he">
      {/* Wave divider */}
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="#0F766E">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Col 1: Brand */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <PawPrint className={styles.logoIcon} />
              <span className={styles.logoText}>PettSuba</span>
            </Link>
            <p className={styles.tagline}>
              Tình yêu thương và sự chuyên nghiệp — mang đến điều tốt nhất cho người bạn bốn chân của bạn.
            </p>
            {/* Social */}
            <div className={styles.socials}>
              <a href="https://www.facebook.com/share/18HSAxL2Ee/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Facebook">
                <Facebook size={17} />
              </a>
              <a href="https://www.threads.com/@pettsuba" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Threads">
                <Instagram size={17} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="TikTok">
                {/* TikTok SVG */}
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V9.14a8.26 8.26 0 0 0 4.83 1.55V7.24a4.85 4.85 0 0 1-1.07-.55Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick links */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Điều hướng</h4>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className={styles.footerLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Danh mục</h4>
            <ul className={styles.linkList}>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link to="/cua-hang" className={styles.footerLink}>{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Liên hệ</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MapPin size={15} className={styles.contactIcon} />
                <span>7 Đ. D1, Long Thạnh Mỹ, Tăng Nhơn Phú, Hồ Chí Minh</span>
              </li>
              <li className={styles.contactItem}>
                <Phone size={15} className={styles.contactIcon} />
                <a href="tel:0123456789" className={styles.contactLink}>0702 290 548</a>
              </li>
              <li className={styles.contactItem}>
                <Mail size={15} className={styles.contactIcon} />
                <a href="mailto:contact@petcare.com" className={styles.contactLink}>petsuba@gmail.com</a>
              </li>
              <li className={styles.contactItem}>
                <Clock size={15} className={styles.contactIcon} />
                <div>
                  <div>T2–T6: 8:00 – 20:00</div>
                  <div>T7–CN: 8:00 – 18:00</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>© 2026 PettSuba. All rights reserved. Made with 🐾</p>
          <div className={styles.bottomLinks}>
            <Link to="/chinh-sach-bao-mat" className={styles.bottomLink}>Chính sách bảo mật</Link>
            <Link to="/dieu-khoan" className={styles.bottomLink}>Điều khoản</Link>
          </div>
        </div>
      </div>

      {/* Live chat FAB */}
      <button className={styles.fab} aria-label="Chat với chúng tôi">
        <MessageCircle size={22} />
      </button>
    </footer>
  );
}