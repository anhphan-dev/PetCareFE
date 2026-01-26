import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gửi liên hệ
  };

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Địa chỉ</h3>
                    <p className="text-gray-600">123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Điện thoại</h3>
                    <p className="text-gray-600">0123 456 789</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <p className="text-gray-600">contact@vetcare.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Giờ làm việc</h3>
                    <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                    <p className="text-gray-600">Thứ 7 - Chủ nhật: 8:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
