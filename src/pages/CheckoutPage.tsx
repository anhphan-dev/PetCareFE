import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { CheckoutService, type CheckoutSummary } from '../services/CheckoutService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);

  const [form, setForm] = useState({
    shippingName: user?.fullName || '',
    shippingPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    shippingCity: user?.city || '',
    shippingDistrict: user?.district || '',
    note: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CheckoutService.getSummary();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        paymentMethod: 'cod',
      });

      await refreshCart();
      navigate(
        `/thanh-toan/thanh-cong?orderNumber=${encodeURIComponent(result.orderNumber)}&amount=${result.finalAmount}`,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-800">Thanh toán đơn hàng</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
              <input
                value={form.shippingName}
                onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                value={form.shippingPhone}
                onChange={(e) => setForm((f) => ({ ...f, shippingPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
              <input
                value={form.shippingAddress}
                onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input
                  value={form.shippingDistrict}
                  onChange={(e) => setForm((f) => ({ ...f, shippingDistrict: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                <input
                  value={form.shippingCity}
                  onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />
            </div>

            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
              Phương thức thanh toán hiện tại: Thanh toán khi nhận hàng (COD)
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link to="/gio-hang" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
              </Link>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="ml-auto px-6 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-gray-400"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
          {!summary || summary.items.length === 0 ? (
            <p className="text-sm text-gray-500">Giỏ hàng của bạn đang trống.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-[340px] overflow-auto pr-1">
                {summary.items.map((item) => (
                  <div key={item.id} className="text-sm border-b border-gray-100 pb-2">
                    <div className="font-medium text-gray-800">{item.productName}</div>
                    <div className="text-gray-500">{item.quantity} x {formatPrice(item.unitPrice)}</div>
                    <div className="text-gray-700">{formatPrice(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(summary.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Phí giao hàng</span><span>{formatPrice(summary.shippingFee)}</span></div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Tổng cộng</span><span>{formatPrice(summary.finalAmount)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
