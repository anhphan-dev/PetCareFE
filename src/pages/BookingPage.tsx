import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PetAPI, { Pet } from '../services/PetAPI';
import { apiService } from '../services/api';
import { appointmentService } from '../services/AppointmentService';

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [servicesList, setServicesList] = useState<{id: string, title: string}[]>([]);
  
  const [form, setForm] = useState({
    petId: '',
    serviceId: '',
    appointmentType: 'Tại phòng khám', // Mặc định
    date: '',
    time: '',
    serviceAddress: '',
    note: '',
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00',
  ];

  const appointmentTypes = ['Tại phòng khám', 'Tại nhà'];

  useEffect(() => {
    // Nếu chưa đăng nhập, đá về đăng nhập
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt lịch!');
      navigate('/dang-nhap');
      return;
    }

    const fetchData = async () => {
      try {
        const [myPets, servicesResponse] = await Promise.all([
          PetAPI.getMyPets(),
          apiService.getServices()
        ]);
        setPets(myPets);
        setServicesList(servicesResponse.map(s => ({id: s.id, title: s.title})));
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi tải dữ liệu thú cưng và dịch vụ.');
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.petId || !form.serviceId || !form.date || !form.time) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      const [h, m] = form.time.split(':').map(Number);
      const ticks = (h * 3600 + m * 60) * 10000000;

      await appointmentService.createAppointment({
        petId: form.petId,
        serviceId: form.serviceId,
        appointmentType: form.appointmentType,
        appointmentDate: new Date(form.date).toISOString(),
        startTime: { ticks },
        endTime: { ticks: ticks + 3600 * 10000000 },
        serviceAddress: form.appointmentType === 'Tại nhà' ? form.serviceAddress : '',
        notes: form.note
      });

      toast.success('Đặt lịch khám thành công!');
      navigate('/'); // hoặc chuyển hướng về trang lịch sử khám
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi đặt lịch.');
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Đặt lịch hẹn khám</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Chọn thú cưng và dịch vụ, hệ thống sẽ gửi yêu cầu tới bác sĩ thú y.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* THÚ CƯNG */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Thú Cưng *</label>
              <select
                value={form.petId}
                onChange={(e) => setForm({ ...form, petId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
              >
                <option value="">-- Chọn thú cưng --</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.petName}</option>
                ))}
              </select>
            </div>

            {/* DỊCH VỤ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Dịch Vụ *</label>
              <select
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {servicesList.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            {/* LOẠI LỊCH HẸN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức khám</label>
              <select
                value={form.appointmentType}
                onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
              >
                {appointmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* ĐỊA CHỈ NẾU TẠI NHÀ */}
            {form.appointmentType === 'Tại nhà' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ khám</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.serviceAddress}
                    onChange={(e) => setForm({ ...form, serviceAddress: e.target.value })}
                    required={form.appointmentType === 'Tại nhà'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NGÀY HẸN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hẹn *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* GIỜ HẸN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hẹn *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
                  >
                    <option value="">Chọn giờ</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* GHI CHÚ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                  placeholder="Ví dụ: Bé đang bị tiêu chảy..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Gửi yêu cầu đặt lịch
            </button>
          </form>
          </div>
        </div>
      </section>
    </>
  );
}
