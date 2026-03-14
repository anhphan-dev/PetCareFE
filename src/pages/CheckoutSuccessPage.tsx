import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckoutService } from '../services/CheckoutService';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  const orderNumber = params.get('orderNumber') || 'N/A';
  const amount = Number(params.get('amount') || 0);
  const method = (params.get('method') || 'cod').toLowerCase();
  const orderCode = Number(params.get('orderCode') || 0);

  useEffect(() => {
    const confirm = async () => {
      if (method !== 'payos') {
        return;
      }

      try {
        const confirmed = await CheckoutService.confirmPayment(
          Number.isFinite(orderCode) && orderCode > 0 ? orderCode : undefined,
          orderNumber !== 'N/A' ? orderNumber : undefined
        );

        setConfirmMessage(
          confirmed
            ? 'Thanh toan PayOS da duoc dong bo vao he thong.'
            : 'Khong the dong bo trang thai PayOS ngay luc nay.'
        );
      } catch {
        setConfirmMessage('Khong the dong bo trang thai PayOS ngay luc nay.');
      }
    };

    void confirm();
  }, [method, orderCode, orderNumber]);

  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công</h1>
        <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại PetCare.</p>

        <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 text-left space-y-2 mb-6">
          <p className="text-sm text-gray-700"><span className="font-semibold">Mã đơn hàng:</span> {orderNumber}</p>
          <p className="text-sm text-gray-700"><span className="font-semibold">Thanh toán:</span> {method === 'payos' ? 'PayOS (Online)' : 'COD (khi nhận hàng)'}</p>
          <p className="text-sm text-gray-700"><span className="font-semibold">Tổng tiền:</span> {formatPrice(amount)}</p>
          {method === 'payos' && confirmMessage && (
            <p className="text-sm text-teal-700"><span className="font-semibold">Dong bo:</span> {confirmMessage}</p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <Link to="/cua-hang" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Tiếp tục mua sắm
          </Link>
          <Link to="/" className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
