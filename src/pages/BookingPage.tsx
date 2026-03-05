import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, PawPrint, MapPin, Stethoscope, Loader2 } from 'lucide-react';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const services = [
  { id: 'home', label: 'Khám bệnh tại nhà' },
  { id: 'checkup', label: 'Khám sức khỏe định kỳ' },
  { id: 'spa', label: 'Thẩm mỹ / Spa' },
  { id: 'dental', label: 'Chăm sóc răng miệng' },
];

const visitTypes = [
  { id: 'clinic', label: 'Tại phòng khám' },
  { id: 'home', label: 'Tại nhà' },
];

export default function BookingPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    serviceId: '',
    visitType: 'clinic',
    petName: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.phone || !form.date || !form.time || !form.serviceId) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Gọi API đăng ký dịch vụ tại đây
      // await BookingService.createAppointment({...});
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.');
      setForm({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        serviceId: '',
        visitType: 'clinic',
        petName: '',
        note: '',
      });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === form.serviceId);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-2/3">
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-teal-100 mb-2">
              <PawPrint className="w-4 h-4" />
              Đăng ký dịch vụ thú y
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Đặt lịch khám & dịch vụ cho thú cưng
            </h1>
            <p className="text-sm md:text-base text-teal-50 max-w-xl">
              Chọn dịch vụ, thời gian phù hợp và để lại thông tin, đội ngũ VetCare sẽ xác nhận lịch
              và tư vấn thêm cho bạn.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-sm text-teal-50 space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>Bác sĩ trực: 08:00 – 20:00</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Hotline cấp cứu: 0123 456 789</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thông tin khách hàng */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
                    Thông tin khách hàng
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ (nếu khám tại nhà)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Số nhà, đường, quận, thành phố..."
                          onChange={(e) => handleChange('note', e.target.value)}
                          value={form.note}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin thú cưng & dịch vụ */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
                    Thông tin thú cưng & dịch vụ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên thú cưng
                      </label>
                      <div className="relative">
                        <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={form.petName}
                          onChange={(e) => handleChange('petName', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                          placeholder="Ví dụ: Milu"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hình thức khám *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {visitTypes.map((v) => (
                          <button
                            type="button"
                            key={v.id}
                            onClick={() => handleChange('visitType', v.id)}
                            className={`px-3 py-2 rounded-lg border text-xs font-medium ${
                              form.visitType === v.id
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày hẹn *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ hẹn *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={form.time}
                          onChange={(e) => handleChange('time', e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
                        >
                          <option value="">Chọn giờ</option>
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dịch vụ *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {services.map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => handleChange('serviceId', s.id)}
                            className={`px-3 py-2 rounded-lg border text-xs font-medium text-left ${
                              form.serviceId === s.id
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú thêm cho bác sĩ
                  </label>
                  <textarea
                    value={form.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm resize-none"
                    placeholder="Triệu chứng, thời gian phát hiện, tiền sử bệnh..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận đặt lịch
                </button>
              </form>
            </div>

            {/* Tóm tắt & hướng dẫn */}
            <aside className="space-y-4">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
                  Tóm tắt đăng ký
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Dịch vụ:</span>
                    <span className="font-medium">
                      {selectedService ? selectedService.label : 'Chưa chọn'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Hình thức:</span>
                    <span className="font-medium">
                      {form.visitType === 'clinic' ? 'Tại phòng khám' : 'Tại nhà'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-medium">
                      {form.date && form.time ? `${form.time} • ${form.date}` : 'Chưa chọn'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Thú cưng:</span>
                    <span className="font-medium">{form.petName || 'Chưa nhập'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-teal-600 text-white rounded-2xl shadow-md p-6 text-sm space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Quy trình sau khi đăng ký
                </h3>
                <p className="text-teal-50">
                  - VetCare sẽ gọi điện xác nhận lại thông tin và thời gian.
                  <br />
                  - Bạn có thể thay đổi lịch hẹn trước ít nhất 2 giờ.
                  <br />
                  - Với khám tại nhà, vui lòng giữ điện thoại luôn trong tình trạng liên lạc.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
