import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, Crown, Home, RefreshCw } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-100 rounded-full p-5">
            <XCircle className="w-14 h-14 text-orange-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán bị hủy</h1>
        <p className="text-gray-500 mb-6">
          Bạn đã hủy quá trình thanh toán. Gói thành viên chưa được kích hoạt.
          <br />
          Bạn có thể thử lại bất kỳ lúc nào.
        </p>

        {orderCode && (
          <div className="bg-gray-50 rounded-xl px-5 py-3 mb-6 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-semibold text-gray-700">#{orderCode}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/membership"
            className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </Link>
          <Link
            to="/"
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>

        <Link
          to="/membership"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline"
        >
          <Crown className="w-4 h-4" />
          Xem các gói thành viên
        </Link>
      </div>
    </div>
  );
}
