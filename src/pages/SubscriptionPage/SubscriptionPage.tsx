import {
  AlertCircle,
  Check,
  ChevronRight,
  Crown,
  Loader,
  Shield,
  Star,
  X,
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
        // Free package — backend activates immediately via the same endpoint
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

if (loading) {
    return (
      <div className={styles.page}>
        {/* Background blobs */}
        <div className={styles.blobContainer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
        </div>

        <div className={styles.container}>
          <section className={styles.loadingState}>
            <div className={styles.loadingIcon}>🐾</div>
            <p className={styles.loadingText}>Đang tải...</p>
          </section>
        </div>
      </div>
    );
  }
  const colClass =
    packages.length === 1
      ? 'max-w-sm mx-auto'
      : packages.length === 2
      ? 'grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <Crown className="w-14 h-14 mx-auto mb-4 text-yellow-300" />
          <h1 className="text-4xl font-bold mb-3">Gói Thành Viên PetCare</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">
            Nâng cấp trải nghiệm chăm sóc thú cưng với các đặc quyền dành riêng cho thành viên VIP
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Error banner */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current subscription banner */}
        {mySubscription?.isActive && (
          <div className="mb-10 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-teal-600 text-white rounded-full p-3">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-teal-600 font-medium">Gói hiện tại của bạn</p>
                  <h3 className="text-xl font-bold text-gray-900">{mySubscription.packageName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Hết hạn: {formatDate(mySubscription.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                  Đang hoạt động
                </span>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="text-sm text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelLoading ? 'Đang hủy...' : 'Hủy gói'}
                </button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Chọn gói phù hợp với bạn
        </h2>

        {packages.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Hiện chưa có gói thành viên nào.</p>
          </div>
        ) : (
          <div className={colClass}>
            {packages.map((pkg, idx) => {
              const isPopular = packages.length > 1 && idx === Math.floor(packages.length / 2);
              const isCurrent =
                mySubscription?.subscriptionPackageId === pkg.id && mySubscription?.isActive;
              const isPaying = payingId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl p-7 flex flex-col transition-shadow hover:shadow-xl ${
                    isPopular
                      ? 'bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-lg ring-2 ring-teal-400'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow">
                      Phổ biến nhất
                    </div>
                  )}

                  {/* Name & description */}
                  <div className="mb-5">
                    <h3
                      className={`text-xl font-bold mb-1 ${
                        isPopular ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    <p className={`text-sm ${isPopular ? 'text-teal-100' : 'text-gray-500'}`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className={`text-3xl font-extrabold ${
                        isPopular ? 'text-white' : 'text-teal-700'
                      }`}
                    >
                      {formatPrice(pkg.price)}
                    </span>
                    {pkg.price > 0 && (
                      <span
                        className={`text-sm ml-1 ${isPopular ? 'text-teal-200' : 'text-gray-400'}`}
                      >
                        /{billingLabel(pkg.billingCycle)}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {Object.entries(pkg.features).map(([feature, included]) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        {included ? (
                          <Check
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isPopular ? 'text-yellow-300' : 'text-teal-500'
                            }`}
                          />
                        ) : (
                          <X
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isPopular ? 'text-teal-400' : 'text-gray-300'
                            }`}
                          />
                        )}
                        <span
                          className={
                            included
                              ? isPopular
                                ? 'text-white'
                                : 'text-gray-700'
                              : isPopular
                              ? 'text-teal-300 line-through'
                              : 'text-gray-400 line-through'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      className={`w-full text-center py-2.5 rounded-xl font-medium border-2 ${
                        isPopular
                          ? 'border-white/40 text-white'
                          : 'border-teal-500 text-teal-600'
                      }`}
                    >
                      ✓ Gói hiện tại
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={isPaying || cancelLoading}
                      className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                        isPopular
                          ? 'bg-white text-teal-700 hover:bg-teal-50'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {isPaying ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          {pkg.price === 0 ? 'Dùng miễn phí' : 'Đăng ký ngay'}
                          <ChevronRight className="w-4 h-4" />
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
        <div className="mt-14 text-center flex items-center justify-center gap-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Thanh toán an toàn qua PayOS · Hủy bất kỳ lúc nào</span>
        </div>
      </div>
    </div>
  );
}
