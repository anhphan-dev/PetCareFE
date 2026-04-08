// SubscriptionPage.tsx
import {
  AlertCircle,
  Check,
  ChevronRight,
  Crown,
  Loader,
  Shield,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionService, {
  SubscriptionPackage,
  UserSubscription,
} from '../../services/SubscriptionService';
import styles from './SubscriptionPage.module.css';

const formatPrice = (price: number) =>
  price === 0
    ? 'Miễn phí'
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const billingLabel = (cycle: string) => {
  if (cycle === 'Monthly') return 'tháng';
  if (cycle === 'Yearly') return 'năm';
  return cycle;
};

export default function SubscriptionPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Logic unchanged ──────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgs = await SubscriptionService.getPackages();
        setPackages(pkgs);
        if (isLoggedIn) {
          const sub = await SubscriptionService.getMySubscription();
          setMySubscription(sub);
        }
      } catch {
        setError('Không thể tải thông tin gói. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!isLoggedIn) {
      navigate('/dang-nhap', { state: { from: '/membership' } });
      return;
    }
    try {
      setError(null);
      setPayingId(pkg.id);
      if (pkg.price === 0) {
        await SubscriptionService.createPayment(pkg.id);
        const sub = await SubscriptionService.getMySubscription();
        setMySubscription(sub);
        setPayingId(null);
        return;
      }
      const link = await SubscriptionService.createPayment(pkg.id);
      window.location.href = link.paymentUrl;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tạo liên kết thanh toán.';
      setError(msg);
      setPayingId(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy gói thành viên hiện tại?')) return;
    try {
      setCancelLoading(true);
      setError(null);
      await SubscriptionService.cancelSubscription();
      setMySubscription(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể hủy gói. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setCancelLoading(false);
    }
  };
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
            <p className={styles.loadingText}>Đang tải gói thành viên...</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroPane} aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={styles.heroPaw}
              style={{
                left: `${8 + i * 16}%`,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${5 + (i % 3)}s`,
                fontSize: `${12 + (i % 3) * 5}px`,
              }}
            >🐾</span>
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.crownWrap}>
            <Crown className={styles.crownIcon} />
          </div>
          <span className={styles.heroEyebrow}>Gói thành viên</span>
          <h1 className={styles.heroTitle}>
            Nâng cấp trải nghiệm<br />
            <span className={styles.heroTitleAccent}>chăm sóc thú cưng</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Đặc quyền dành riêng cho thành viên VIP — ưu đãi độc quyền, dịch vụ ưu tiên
            và tình yêu thương không giới hạn dành cho người bạn bốn chân.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Current subscription banner */}
        {mySubscription?.isActive && (
          <div className={styles.currentSubBanner}>
            <div className={styles.currentSubLeft}>
              <div className={styles.currentSubIconWrap}>
                <Crown className={styles.currentSubIcon} />
              </div>
              <div>
                <p className={styles.currentSubLabel}>Gói hiện tại của bạn</p>
                <h3 className={styles.currentSubName}>{mySubscription.packageName}</h3>
                <p className={styles.currentSubExpiry}>
                  Hết hạn: {formatDate(mySubscription.endDate)}
                </p>
              </div>
            </div>
            <div className={styles.currentSubRight}>
              <span className={styles.activeBadge}>✦ Đang hoạt động</span>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className={styles.cancelBtn}
              >
                {cancelLoading ? 'Đang hủy...' : 'Hủy gói'}
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Chọn gói phù hợp với bạn 🐾</h2>
        </div>

        {/* Packages */}
        {packages.length === 0 ? (
          <div className={styles.emptyPackages}>
            <span className={styles.emptyIcon}>⭐</span>
            <p className={styles.emptyText}>Hiện chưa có gói thành viên nào.</p>
          </div>
        ) : (
          <div className={styles.packagesGrid}>
            {packages.map((pkg, idx) => {
              const isPopular = packages.length > 1 && idx === Math.floor(packages.length / 2);
              const isCurrent =
                mySubscription?.subscriptionPackageId === pkg.id && mySubscription?.isActive;
              const isPaying = payingId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`${styles.pkgCard} ${isPopular ? styles.pkgCardPopular : styles.pkgCardDefault}`}
                  style={{ '--idx': idx } as React.CSSProperties}
                >
                  {isPopular && (
                    <div className={styles.popularBadge}>✦ Phổ biến nhất</div>
                  )}

                  {/* Head */}
                  <div className={styles.pkgHead}>
                    <h3 className={`${styles.pkgName} ${isPopular ? styles.pkgNamePopular : styles.pkgNameDefault}`}>
                      {pkg.name}
                    </h3>
                    <p className={`${styles.pkgDesc} ${isPopular ? styles.pkgDescPopular : styles.pkgDescDefault}`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className={styles.pkgPriceRow}>
                    <span className={`${styles.pkgPrice} ${isPopular ? styles.pkgPricePopular : styles.pkgPriceDefault}`}>
                      {formatPrice(pkg.price)}
                    </span>
                    {pkg.price > 0 && (
                      <span className={`${styles.pkgCycle} ${isPopular ? styles.pkgCyclePopular : styles.pkgCycleDefault}`}>
                        /{billingLabel(pkg.billingCycle)}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`${styles.pkgDivider} ${isPopular ? styles.pkgDividerPopular : styles.pkgDividerDefault}`} />

                  {/* Features */}
                  <ul className={styles.pkgFeatures}>
                    {Object.entries(pkg.features).map(([feature, included]) => (
                      <li key={feature} className={styles.pkgFeatureItem}>
                        {included ? (
                          <Check
                            size={15}
                            className={isPopular ? styles.featureCheckPopular : styles.featureCheckDefault}
                          />
                        ) : (
                          <X
                            size={15}
                            className={isPopular ? styles.featureXPopular : styles.featureXDefault}
                          />
                        )}
                        <span
                          className={
                            included
                              ? isPopular ? styles.featureTextOnPop  : styles.featureTextOn
                              : isPopular ? styles.featureTextOffPop : styles.featureTextOff
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className={`${styles.pkgCtaCurrent} ${isPopular ? styles.pkgCtaCurrentPopular : styles.pkgCtaCurrentDefault}`}>
                      ✓ Gói hiện tại
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={isPaying || cancelLoading}
                      className={`${styles.pkgCtaBtn} ${isPopular ? styles.pkgCtaBtnPopular : styles.pkgCtaBtnDefault}`}
                    >
                      {isPaying ? (
                        <>
                          <Loader size={15} className={styles.spinSmall} />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          {pkg.price === 0 ? 'Dùng miễn phí' : 'Đăng ký ngay'}
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Security note */}
        <div className={styles.securityNote}>
          <Shield size={15} />
          <span>Thanh toán an toàn qua PayOS · Hủy bất kỳ lúc nào</span>
        </div>
      </div>
    </div>
  );
}