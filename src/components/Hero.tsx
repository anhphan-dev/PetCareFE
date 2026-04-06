// Hero.tsx
import { Compass, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      {/* Bokeh blobs */}
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={`${styles.blob} ${styles.blobC}`} />
      </div>

      {/* Floating paws */}
      <div className={styles.paws} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={styles.paw}
            style={{
              left: `${8 + i * 16}%`,
              animationDelay: `${i * 0.85}s`,
              animationDuration: `${5 + (i % 3)}s`,
              fontSize: `${12 + (i % 3) * 5}px`,
            }}
          >🐾</span>
        ))}
      </div>

      <div className={styles.inner}>
        {/* ── Left column ── */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>🐾 Cửa hàng thú cưng #1 Việt Nam</span>
          <h1 className={styles.heading}>
            Chăm sóc thú cưng<br />
            <span className={styles.headingAccent}>như gia đình</span>
          </h1>
          <p className={styles.subtext}>
            Tất cả sản phẩm cao cấp, dịch vụ tận tâm và tình yêu thương dành trọn
            cho người bạn bốn chân của bạn. Vì mỗi thú cưng đều xứng đáng được yêu thương nhất.
          </p>

          <div className={styles.btnRow}>
            <button className={styles.primaryBtn} onClick={() => navigate('/cua-hang')}>
              <ShoppingBag size={17} />
              Mua ngay
            </button>
            <button className={styles.secondaryBtn} onClick={() => navigate('/dat-lich')}>
              <Compass size={17} />
              Khám phá
            </button>
          </div>

          {/* Trust badges */}
          <div className={styles.badges}>
            {[
              { num: '10k+', label: 'Khách hàng' },
              { num: '500+', label: 'Sản phẩm' },
              { num: '5★',  label: 'Đánh giá' },
            ].map((b) => (
              <div key={b.label} className={styles.badge}>
                <span className={styles.badgeNum}>{b.num}</span>
                <span className={styles.badgeLabel}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className={styles.imageCol}>
          <div className={styles.imageCard}>
            <img
              src="https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=700"
              alt="Thú cưng đáng yêu"
              className={styles.heroImg}
              loading="eager"
            />
            {/* Floating tag */}
            <div className={styles.floatTag}>
              <span>❤️</span>
              <span>Được yêu thích nhất</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}