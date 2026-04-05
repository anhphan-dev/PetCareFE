// CheckoutPage.tsx
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  Phone,
  Tag,
  Truck,
  User
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { CheckoutService, CheckoutSummary } from '../../services/CheckoutService';
import styles from './CheckoutPage.module.css';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    shippingName: user?.fullName || '',
    shippingPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    shippingCity: user?.city || '',
    shippingDistrict: user?.district || '',
    note: '',
    paymentMethod: 'payos',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CheckoutService.getSummary(voucherCode);
        setSummary(data);
        setVoucherMessage(data.voucherMessage || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyVoucher = async () => {
    try {
      setApplyingVoucher(true);
      setError(null);
      const data = await CheckoutService.getSummary(voucherCode);
      setSummary(data);
      setVoucherMessage(data.voucherMessage || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể áp dụng voucher.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      !!form.shippingName.trim() &&
      !!form.shippingPhone.trim() &&
      !!form.shippingAddress.trim() &&
      !!summary &&
      summary.items.length > 0
    );
  }, [form, summary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const result = await CheckoutService.placeOrder({
        shippingName: form.shippingName.trim(),
        shippingPhone: form.shippingPhone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        shippingCity: form.shippingCity.trim() || undefined,
        shippingDistrict: form.shippingDistrict.trim() || undefined,
        note: form.note.trim() || undefined,
        paymentMethod: form.paymentMethod,
        voucherCode: voucherCode.trim() || undefined,
        returnBaseUrl: window.location.origin,
      });

      await refreshCart();

      if (form.paymentMethod === 'payos' && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      navigate(
        `/thanh-toan/thanh-cong?orderNumber=${encodeURIComponent(result.orderNumber)}&amount=${result.finalAmount}&method=${encodeURIComponent(form.paymentMethod)}`,
        { replace: true }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingInner}>
          <Loader2 className={styles.spinner} />
          <p className={styles.loadingText}>Đang tải thông tin thanh toán...</p>
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
      </div>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/gio-hang" className={styles.backBtn}>
            <ArrowLeft size={15} />
            Quay lại giỏ hàng
          </Link>
          <ChevronRight size={14} className={styles.breadSep} />
          <span className={styles.breadStep}>Thông tin giao hàng</span>
          <ChevronRight size={14} className={styles.breadSep} />
          <span className={`${styles.breadStep} ${styles.breadActive}`}>Thanh toán</span>
        </nav>

        {/* Page title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Thanh toán đơn hàng 🐾</h1>
          <p className={styles.pageSubtitle}>Điền thông tin giao hàng và chọn phương thức thanh toán</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.layout}>
          {/* ── LEFT: Form ── */}
          <form onSubmit={handleSubmit} className={styles.formCard} noValidate>

            {/* Section: Shipping info */}
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <MapPin size={15} className={styles.sectionIcon} />
                Thông tin giao hàng
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <User size={13} />
                    Tên người nhận <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.shippingName}
                    onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    required
                    aria-required="true"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <Phone size={13} />
                    Số điện thoại <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.shippingPhone}
                    onChange={(e) => setForm((f) => ({ ...f, shippingPhone: e.target.value }))}
                    placeholder="0912 345 678"
                    type="tel"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin size={13} />
                  Địa chỉ giao hàng <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  value={form.shippingAddress}
                  onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
                  placeholder="Số nhà, tên đường, phường/xã"
                  required
                  aria-required="true"
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>Quận / Huyện</label>
                  <input
                    className={styles.input}
                    value={form.shippingDistrict}
                    onChange={(e) => setForm((f) => ({ ...f, shippingDistrict: e.target.value }))}
                    placeholder="Quận Hoàn Kiếm"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Thành phố / Tỉnh</label>
                  <input
                    className={styles.input}
                    value={form.shippingCity}
                    onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                    placeholder="Hà Nội"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <FileText size={13} />
                  Ghi chú đơn hàng
                </label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Ghi chú cho người giao hàng (tuỳ chọn)"
                  rows={3}
                />
              </div>
            </div>

            {/* Divider */}
            <div className={styles.formDivider} />

            {/* Section: Voucher */}
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <Tag size={15} className={styles.sectionIcon} />
                Mã giảm giá
              </div>
              <div className={styles.voucherRow}>
                <input
                  className={`${styles.input} ${styles.voucherInput}`}
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Nhập mã voucher..."
                  aria-label="Mã voucher"
                />
                <button
                  type="button"
                  onClick={applyVoucher}
                  disabled={applyingVoucher || !voucherCode.trim()}
                  className={styles.voucherBtn}
                >
                  {applyingVoucher ? <Loader2 size={14} className={styles.spinSmall} /> : null}
                  {applyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                </button>
              </div>
              {voucherMessage && (
                <p className={`${styles.voucherMsg} ${summary?.hasVoucherDiscount ? styles.voucherSuccess : styles.voucherInfo}`}>
                  {summary?.hasVoucherDiscount ? '✅' : 'ℹ️'} {voucherMessage}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className={styles.formDivider} />

            {/* Section: Payment method */}
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>
                <CreditCard size={15} className={styles.sectionIcon} />
                Phương thức thanh toán
              </div>
              <div className={styles.paymentGrid}>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: 'payos' }))}
                  className={`${styles.paymentCard} ${form.paymentMethod === 'payos' ? styles.paymentCardActive : ''}`}
                  aria-pressed={form.paymentMethod === 'payos'}
                >
                  <span className={styles.paymentEmoji}>💳</span>
                  <div>
                    <div className={styles.paymentTitle}>PayOS</div>
                    <div className={styles.paymentSub}>Thanh toán online an toàn</div>
                  </div>
                  <div className={`${styles.paymentDot} ${form.paymentMethod === 'payos' ? styles.paymentDotActive : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: 'cod' }))}
                  className={`${styles.paymentCard} ${form.paymentMethod === 'cod' ? styles.paymentCardActive : ''}`}
                  aria-pressed={form.paymentMethod === 'cod'}
                >
                  <span className={styles.paymentEmoji}>🚚</span>
                  <div>
                    <div className={styles.paymentTitle}>COD</div>
                    <div className={styles.paymentSub}>Thanh toán khi nhận hàng</div>
                  </div>
                  <div className={`${styles.paymentDot} ${form.paymentMethod === 'cod' ? styles.paymentDotActive : ''}`} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className={styles.formFooter}>
              <Link to="/gio-hang" className={styles.cancelLink}>
                <ArrowLeft size={15} />
                Quay lại
              </Link>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!canSubmit || submitting}
              >
                {submitting
                  ? <><Loader2 size={16} className={styles.spinSmall} /> Đang xử lý...</>
                  : form.paymentMethod === 'payos'
                    ? <><CreditCard size={16} /> Thanh toán với PayOS</>
                    : <><Package size={16} /> Đặt hàng ngay</>
                }
              </button>
            </div>
          </form>

          {/* ── RIGHT: Order summary ── */}
          <aside className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <Package size={16} className={styles.sectionIcon} />
              <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
            </div>

            {!summary || summary.items.length === 0 ? (
              <div className={styles.emptyCart}>
                <span className={styles.emptyIcon}>🛒</span>
                <p>Giỏ hàng của bạn đang trống.</p>
                <Link to="/cua-hang" className={styles.shopLink}>Tiếp tục mua sắm</Link>
              </div>
            ) : (
              <>
                <div className={styles.itemList}>
                  {summary.items.map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.productName}</p>
                        <p className={styles.itemQty}>{item.quantity} × {formatPrice(item.unitPrice)}</p>
                      </div>
                      <span className={styles.itemTotal}>{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.priceRows}>
                  <div className={styles.priceRow}>
                    <span>Tạm tính</span>
                    <span>{formatPrice(summary.totalAmount)}</span>
                  </div>

                  {(summary.membershipDiscountAmount ?? 0) > 0 && (
                    <div className={`${styles.priceRow} ${styles.priceDiscount}`}>
                      <span>
                        Giảm thành viên
                        {summary.membershipDiscountRate
                          ? ` (${Math.round(summary.membershipDiscountRate * 100)}%)`
                          : ''}
                      </span>
                      <span>−{formatPrice(summary.membershipDiscountAmount ?? 0)}</span>
                    </div>
                  )}

                  {(summary.voucherDiscountAmount ?? 0) > 0 && (
                    <div className={`${styles.priceRow} ${styles.priceDiscount}`}>
                      <span>Voucher {summary.voucherCode ? `(${summary.voucherCode})` : ''}</span>
                      <span>−{formatPrice(summary.voucherDiscountAmount ?? 0)}</span>
                    </div>
                  )}

                  <div className={styles.priceRow}>
                    <span className={styles.shippingLabel}>
                      <Truck size={13} />
                      Phí giao hàng
                    </span>
                    <span>{formatPrice(summary.shippingFee)}</span>
                  </div>
                </div>

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Tổng cộng</span>
                  <span className={styles.totalAmount}>{formatPrice(summary.finalAmount)}</span>
                </div>

                <p className={styles.secureNote}>
                  🔒 Thông tin thanh toán được mã hoá an toàn
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}