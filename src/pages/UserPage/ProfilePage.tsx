import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  UserCircle,
  Dog,
  Briefcase,
  Plus,
  Loader,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { ProfileService } from '../../services/AuthService/ProfileAPI';
import { useEffect} from 'react';

import PetAPI, { type Pet } from '../../services/PetService/PetAPI';
import { getImageUrl } from '../../utils/imageUtils';



export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    district: user?.district || '',
  });

  const extractArray = <T,>(response: any): T[] => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.items && Array.isArray(response.items)) return response.items;
    return [];
  };

  useEffect(() => {
    if (!user?.id) {
      setPets([]);
      return;
    }

    (async () => {
      try {
        setLoadingPets(true);
        const response = await PetAPI.getMyPets();
        const apiPets = extractArray<Pet>(response);
        setPets(apiPets ?? []);
      } catch (err) {
        console.error('Failed to load pets in profile page:', err);
        setPets([]);
      } finally {
        setLoadingPets(false);
      }
    })();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const updatedUser = await ProfileService.updateProfile(formData);
      setUser(updatedUser);
      setSuccess('Cập nhật thông tin thành công!');
      setEditMode(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const imageUrl = await ProfileService.uploadAvatar(file);
      const updatedUser = await ProfileService.updateProfile({ avatarUrl: imageUrl });
      setUser(updatedUser);
      setSuccess('Cập nhật ảnh đại diện thành công!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin đổi mật khẩu.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await ProfileService.changePassword(passwordForm);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangePasswordOpen(false);
      setShowPw({ current: false, next: false, confirm: false });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Bạn chưa đăng nhập</h1>
          <p className="text-gray-600">
            Vui lòng đăng nhập để xem thông tin tài khoản, thú cưng và dịch vụ.
          </p>
          <Link
            to="/dang-nhap"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Alert Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hồ sơ của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý thông tin cá nhân, thú cưng và các dịch vụ đã đặt.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            <Shield className="w-3 h-3" />
            {user.roleName}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-6">
          {/* Thông tin cơ bản */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-4 relative group">
              {user.avatarUrl ? (
                <div className="relative">
                  <img
                    src={getImageUrl(user.avatarUrl)}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-100"
                  />
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={loading}
                        className="hidden"
                      />
                      <span className="text-white text-xs font-medium">Thay đổi</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 relative group">
                  <UserCircle className="w-10 h-10" />
                  <label className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={loading}
                      className="hidden"
                    />
                    <span className="text-white text-xs font-medium">Thêm ảnh</span>
                  </label>
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-800">{editMode ? 'Chỉnh sửa thông tin' : user.fullName}</h2>
                <p className="text-sm text-gray-500">Thành viên từ {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {!editMode ? (
              <>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-teal-600" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {(user.address || user.district || user.city) && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span>
                        {[user.address, user.district, user.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>
                      Ngày tạo tài khoản: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Chỉnh sửa thông tin
                  </button>

                  <button
                    onClick={() => setIsChangePasswordOpen((o) => !o)}
                    disabled={loading}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading && isChangePasswordOpen ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    Đổi mật khẩu
                  </button>

                  {isChangePasswordOpen && (
                    <form onSubmit={handleChangePassword} className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                        <div className="relative">
                          <input
                            type={showPw.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                            disabled={loading}
                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <div className="relative">
                          <input
                            type={showPw.next ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                            disabled={loading}
                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPw.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Gợi ý: tối thiểu 6 ký tự.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                          <input
                            type={showPw.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                            disabled={loading}
                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
                        >
                          {loading && <Loader className="w-4 h-4 animate-spin" />}
                          Lưu mật khẩu
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setIsChangePasswordOpen(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowPw({ current: false, next: false, confirm: false });
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        fullName: user?.fullName || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        city: user?.city || '',
                        district: user?.district || '',
                      });
                    }}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Thú cưng & Dịch vụ */}
          <section className="space-y-4">
            {/* Thú cưng */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <Dog className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Thú cưng
                    </h2>
                    <p className="text-xs text-gray-500">
                      Quản lý hồ sơ sức khỏe thú cưng của bạn
                    </p>
                  </div>
                </div>
                <button onClick={() => navigate('/thu-cung')} className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
                  <Plus className="w-3 h-3" />
                  Thêm thú cưng
                </button>
              </div>

              {loadingPets ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
                  Đang tải danh sách thú cưng...
                </div>
              ) : pets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
                  <p className="mb-1">Bạn chưa thêm thú cưng nào.</p>
                  <p>Nhấn vào nút “Thêm thú cưng” để bắt đầu tạo hồ sơ.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pets.slice(0, 3).map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => navigate('/thu-cung')}
                      className="w-full text-left rounded-xl border border-gray-200 bg-gray-50 p-3 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{pet.petName || 'Chưa đặt tên'}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {pet.speciesName || 'Chưa có loài'}
                        {pet.breedName ? ` • ${pet.breedName}` : ''}
                      </div>
                    </button>
                  ))}
                  {pets.length > 3 && (
                    <button
                      onClick={() => navigate('/thu-cung')}
                      className="text-xs font-medium text-teal-700 hover:text-teal-800"
                    >
                      Xem thêm {pets.length - 3} thú cưng...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Dịch vụ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Dịch vụ
                    </h2>
                    <p className="text-xs text-gray-500">
                      Xem nhanh các dịch vụ bạn đã đặt hoặc đang sử dụng
                    </p>
                  </div>
                </div>
                <Link
                  to="/dich-vu"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Xem tất cả dịch vụ
                </Link>
              </div>

              <div className="rounded-xl border border-dashed border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
                <p className="mb-1">Hiện chưa có dữ liệu dịch vụ.</p>
                <p>
                  Khi bạn đặt lịch hoặc sử dụng dịch vụ, thông tin sẽ hiển thị tại đây.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

