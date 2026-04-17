import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Lock, Mail, PawPrint } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthAPI';
import { clearTokenRevocation } from '../../utils/tokenRevocation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleSuccess = async (idToken: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.googleLogin(idToken);
      clearTokenRevocation(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('tokenExpiresAt', response.expiresAt);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      const role = response.user.roleName?.trim().toLowerCase() || 'customer';
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'staff') navigate('/staff', { replace: true });
      else if (role === 'doctor') navigate('/doctor', { replace: true });
      else if (role === 'provider' || role === 'serviceprovider' || role === 'service_provider') {
        navigate('/provider', { replace: true });
      }
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login({ email, password });
      clearTokenRevocation(response.token);

      // Lưu thông tin
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('tokenExpiresAt', response.expiresAt);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user); // Cập nhật context ngay lập tức

      // Phân luồng redirect theo role
      const role = response.user.roleName?.trim().toLowerCase() || 'user';

      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'staff') {
        navigate('/staff', { replace: true });
      } else if (role === 'doctor') {
        navigate('/doctor', { replace: true });
      } else if (role === 'provider' || role === 'serviceprovider') {
        navigate('/provider', { replace: true });
      } else if (role === 'service_provider') {
        navigate('/provider', { replace: true });
      } else {
        // user hoặc Customer hoặc role lạ → về trang customer hoặc home
        navigate('/', { replace: true });
        // Nếu chưa có /customer → dùng navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 overflow-hidden">
          <div className="flex justify-center mb-8">
            <div className="bg-teal-100 p-4 rounded-full">
              <PawPrint className="w-12 h-12 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Đăng nhập
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Chào mừng bạn trở lại PetSuba
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/quen-mat-khau" className="text-teal-600 hover:text-teal-700 font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-400">hoặc</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    handleGoogleSuccess(credentialResponse.credential);
                  }
                }}
                onError={() => setError('Google login was cancelled or failed.')}
                width="368"
                text="signin_with"
                shape="rectangular"
                theme="outline"
                locale="vi"
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="text-teal-600 font-medium hover:text-teal-700">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}