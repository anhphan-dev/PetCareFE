// SubscriptionSuccessPage.tsx
import { CheckCircle, Crown, Home, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionService, { UserSubscription } from '../../services/SubscriptionService';
import styles from './SubscriptionPage.module.css';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const orderCode = searchParams.get('orderCode');

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Logic unchanged ──────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const parsedOrderCode = orderCode ? Number(orderCode) : NaN;
        if (Number.isFinite(parsedOrderCode) && parsedOrderCode > 0) {
          await SubscriptionService.confirmPayment(parsedOrderCode);
        }
        const sub = await SubscriptionService.getMySubscription();
        setSubscription(sub);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);
  // ── End logic ────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.blobContainer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
        </div>
        <div className={styles.container}>
          <section className={styles.loadingState}>
            <div className={styles.loadingIcon}>🐾</div>
            <p className={styles.loadingText}>Đang kích hoạt gói thành viên...</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultPage}>
      {/* Blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      <div className={styles.resultCard}>
        {loading ? (
          <Loader size={44} style={{ color: '#0D9488', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        ) : (
          <>
            {/* Icon */}
            <div className={styles.resultIconWrap}>
              <div className={`${styles.resultIconRing} ${styles.resultIconRingSuccess}`} />
              <CheckCircle className={`${styles.resultIcon} ${styles.resultIconSuccess}`} />
            </div>

            <h1 className={styles.resultTitle}>Thanh toán thành công!</h1>
            <p className={styles.resultSubtitle}>
              Gói thành viên đã được kích hoạt. Cảm ơn bạn đã tin tưởng&nbsp;
              <strong style={{ color: '#0D9488' }}>PettSuba</strong>! 🐾
            </p>

            {/* Order info */}
            {(orderCode || subscription) && (
              <div className={styles.infoBox}>
                {orderCode && (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Mã đơn hàng</span>
                      <span className={styles.infoRowValue}>#{orderCode}</span>
                    </div>
                    {subscription && <div className={styles.infoRowDivider} />}
                  </>
                )}
                {subscription && (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Gói đã đăng ký</span>
                      <span className={styles.infoRowValue}>{subscription.packageName}</span>
                    </div>
                    <div className={styles.infoRowDivider} />
                    <div className={styles.infoRow}>
                      <span className={styles.infoRowLabel}>Hết hạn</span>
                      <span className={styles.infoRowValue}>{formatDate(subscription.endDate)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Active badge */}
            {subscription?.isActive && (
              <div className={styles.subActiveBadge}>
                <Crown size={16} style={{ color: '#F59E0B' }} />
                {subscription.packageName} — Đang hoạt động
              </div>
            )}

            {/* Actions */}
            <div className={styles.resultActions}>
              <Link to="/membership" className={styles.resultPrimaryBtn}>
                <Crown size={15} />
                Xem gói thành viên
              </Link>
              <Link to="/" className={styles.resultSecondaryBtn}>
                <Home size={15} />
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}