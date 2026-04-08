// SubscriptionCancelPage.tsx
import { Crown, Home, RefreshCw, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './SubscriptionPage.module.css';

export default function SubscriptionCancelPage() {
  // ── Logic unchanged ──────────────────────────────
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  // ── End logic ────────────────────────────────────

  return (
    <div className={styles.resultPage}>
      {/* Blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      <div className={styles.resultCard}>
        {/* Icon */}
        <div className={styles.resultIconWrap}>
          <div className={`${styles.resultIconRing} ${styles.resultIconRingCancel}`} />
          <XCircle className={`${styles.resultIcon} ${styles.resultIconCancel}`} />
        </div>

        <h1 className={styles.resultTitle}>Thanh toán bị hủy</h1>
        <p className={styles.resultSubtitle}>
          Bạn đã hủy quá trình thanh toán. Gói thành viên chưa được kích hoạt.
          Bạn có thể thử lại bất kỳ lúc nào.
        </p>

        {/* Order code */}
        {orderCode && (
          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <span className={styles.infoRowLabel}>Mã đơn hàng</span>
              <span className={styles.infoRowValue}>#{orderCode}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.resultActions}>
          <Link to="/membership" className={styles.resultPrimaryBtn}>
            <RefreshCw size={15} />
            Thử lại
          </Link>
          <Link to="/" className={styles.resultSecondaryBtn}>
            <Home size={15} />
            Về trang chủ
          </Link>
        </div>

        <Link to="/membership" className={styles.resultFooterLink}>
          <Crown size={14} />
          Xem các gói thành viên
        </Link>
      </div>
    </div>
  );
}