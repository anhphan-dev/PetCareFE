// CheckoutSuccessPage.tsx
import { CheckCircle, CreditCard, Home, Loader2, Package, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckoutService } from '../../services/CheckoutService';
import styles from './Checkoutsuccesspage.module.css';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [confirming, setConfirming] = useState(false);

  const orderNumber = params.get('orderNumber') || 'N/A';
  const amount = Number(params.get('amount') || 0);
  const method = (params.get('method') || 'cod').toLowerCase();
  const orderCode = Number(params.get('orderCode') || 0);

  useEffect(() => {
    const confirm = async () => {
      if (method !== 'payos') return;

      try {
        setConfirming(true);
        const confirmed = await CheckoutService.confirmPayment(
          Number.isFinite(orderCode) && orderCode > 0 ? orderCode : undefined,
          orderNumber !== 'N/A' ? orderNumber : undefined
        );
        setConfirmMessage(
          confirmed
            ? 'Thanh toán PayOS đã được đồng bộ vào hệ thống.'
            : 'Không thể đồng bộ trạng thái PayOS ngay lúc này.'
        );
      } catch {
        setConfirmMessage('Không thể đồng bộ trạng thái PayOS ngay lúc này.');
      } finally {
        setConfirming(false);
      }
    };

    void confirm();
  }, [method, orderCode, orderNumber]);

  const isPayos = method === 'payos';

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>

      {/* Floating paw prints */}
      <div className={styles.pawsContainer} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={styles.floatingPaw} style={{
            left: `${8 + i * 16}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + (i % 3)}s`,
            fontSize: `${12 + (i % 3) * 5}px`,
          }}>🐾</span>
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          {/* Success icon */}
          <div className={styles.iconWrapper}>
            <div className={styles.iconRing} />
            <CheckCircle className={styles.checkIcon} />
          </div>

          {/* Heading */}
          <h1 className={styles.title}>Đặt hàng thành công!</h1>
          <p className={styles.subtitle}>
            Cảm ơn bạn đã tin tưởng mua sắm tại <strong>PetCare</strong> 🐾<br />
            Chúng tôi sẽ giao hàng đến bạn sớm nhất có thể.
          </p>

          {/* Order details block */}
          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                <Package size={14} />
                Mã đơn hàng
              </span>
              <span className={styles.detailValue}>{orderNumber}</span>
            </div>

            <div className={styles.detailDivider} />

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {isPayos ? <CreditCard size={14} /> : <Truck size={14} />}
                Thanh toán
              </span>
              <span className={styles.detailValue}>
                {isPayos ? 'PayOS (Online)' : 'COD — Thanh toán khi nhận hàng'}
              </span>
            </div>

            <div className={styles.detailDivider} />

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                💰 Tổng tiền
              </span>
              <span className={`${styles.detailValue} ${styles.detailPrice}`}>
                {formatPrice(amount)}
              </span>
            </div>

            {/* PayOS sync status */}
            {isPayos && (
              <>
                <div className={styles.detailDivider} />
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>🔄 Đồng bộ</span>
                  <span className={styles.detailValue}>
                    {confirming
                      ? <span className={styles.syncPending}><Loader2 size={13} className={styles.spinSmall} /> Đang đồng bộ...</span>
                      : confirmMessage
                        ? <span className={confirmMessage.includes('đã được') ? styles.syncSuccess : styles.syncFail}>
                            {confirmMessage.includes('đã được') ? '✅' : '⚠️'} {confirmMessage}
                          </span>
                        : null
                    }
                  </span>
                </div>
              </>
            )}
          </div>

          {/* COD instructions */}
          {!isPayos && (
            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                🚚 Đơn hàng của bạn đang được xử lý. Nhân viên giao hàng sẽ liên hệ với bạn trong vòng <strong>24–48 giờ</strong>.
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div className={styles.actions}>
            <Link to="/cua-hang" className={styles.secondaryBtn}>
              <ShoppingBag size={16} />
              Tiếp tục mua sắm
            </Link>
            <Link to="/" className={styles.primaryBtn}>
              <Home size={16} />
              Về trang chủ
            </Link>
          </div>

          {/* Secure note */}
          <p className={styles.secureNote}>
            🔒 Thông tin đơn hàng được lưu trữ an toàn
          </p>
        </div>
      </div>
    </div>
  );
}