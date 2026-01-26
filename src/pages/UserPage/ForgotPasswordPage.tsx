import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Quên mật khẩu</h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Nhập email để nhận link đặt lại mật khẩu.
        </p>
        <div className="relative mb-6">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email của bạn"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-4">
          Gửi link đặt lại mật khẩu
        </button>
        <Link
          to="/dang-nhap"
          className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
