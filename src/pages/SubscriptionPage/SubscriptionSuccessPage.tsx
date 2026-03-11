import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, Home, Loader } from 'lucide-react';
import SubscriptionService, { UserSubscription } from '../../services/SubscriptionService';
import { useAuth } from '../../contexts/AuthContext';

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

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    // Give the webhook a moment to process before fetching status
    const timer = setTimeout(async () => {
      try {
        const sub = await SubscriptionService.getMySubscription();
        setSubscription(sub);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {loading ? (
          <Loader className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
        ) : (
          <>
            {/* Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 rounded-full p-5">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-6">
              Gói thành viên của bạn đã được kích hoạt. Cảm ơn bạn đã tin tưởng PetCare!
            </p>

            {/* Order info */}
            {orderCode && (
              <div className="bg-gray-50 rounded-xl px-5 py-4 mb-6 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-semibold text-gray-800">#{orderCode}</span>
                </div>
                {subscription && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gói đã đăng ký</span>
                      <span className="font-semibold text-gray-800">{subscription.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hết hạn</span>
                      <span className="font-semibold text-gray-800">
                        {formatDate(subscription.endDate)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Subscription active badge */}
            {subscription?.isActive && (
              <div className="flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 rounded-xl py-3 mb-6 text-teal-700 font-medium text-sm">
                <Crown className="w-4 h-4 text-yellow-500" />
                {subscription.packageName} — Đang hoạt động
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/membership"
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Xem gói thành viên
              </Link>
              <Link
                to="/"
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
