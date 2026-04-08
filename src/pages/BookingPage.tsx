import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { appointmentService } from '../services/AppointmentService';
import PetAPI, { Pet } from '../services/PetAPI';

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [servicesList, setServicesList] = useState<{ id: string; title: string }[]>([]);

  const [form, setForm] = useState({
    petId: '',
    serviceId: '',
    appointmentType: 'Tại phòng khám',
    date: '',
    time: '',
    serviceAddress: '',
    note: '',
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00',
  ];

  const appointmentTypes = ['Tại phòng khám', 'Tại nhà'];

  useEffect(() => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập!');
      navigate('/dang-nhap');
      return;
    }

    const fetchData = async () => {
      try {
        const [myPets, servicesResponse] = await Promise.all([
          PetAPI.getMyPets(),
          apiService.getServices(),
        ]);

        setPets(myPets);
        setServicesList(servicesResponse.map((s) => ({
          id: s.id,
          title: s.title,
        })));
      } catch (err) {
        toast.error('Lỗi tải dữ liệu!');
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.petId || !form.serviceId || !form.date || !form.time) {
      toast.error('Vui lòng nhập đầy đủ!');
      return;
    }

    try {
      // ✅ format TimeSpan chuẩn .NET
      const startTime = `${form.time}:00`;

      const [h, m] = form.time.split(':').map(Number);
      const endHour = h + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      await appointmentService.createAppointment({
        petId: form.petId,
        serviceId: form.serviceId,
        appointmentType: form.appointmentType,
        appointmentDate: new Date(form.date).toISOString(),

        // ✅ QUAN TRỌNG
        startTime,
        endTime,

        serviceAddress: form.appointmentType === 'Tại nhà' ? form.serviceAddress : '',
        notes: form.note,
      });

      toast.success('Đặt lịch thành công!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đặt lịch!');
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-20 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Đặt lịch khám</h1>
          <p>Chọn thú cưng và dịch vụ</p>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* PET */}
            <select
              value={form.petId}
              onChange={(e) => setForm({ ...form, petId: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="">Chọn thú cưng</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.petName}</option>
              ))}
            </select>

            {/* SERVICE */}
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="">Chọn dịch vụ</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>

            {/* TYPE */}
            <select
              value={form.appointmentType}
              onChange={(e) => setForm({ ...form, appointmentType: e.target.value })}
              className="w-full p-3 border rounded"
            >
              {appointmentTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* ADDRESS */}
            {form.appointmentType === 'Tại nhà' && (
              <input
                placeholder="Địa chỉ"
                value={form.serviceAddress}
                onChange={(e) => setForm({ ...form, serviceAddress: e.target.value })}
                className="w-full p-3 border rounded"
              />
            )}

            {/* DATE */}
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full p-3 border rounded"
            />

            {/* TIME */}
            <select
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="">Chọn giờ</option>
              {timeSlots.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* NOTE */}
            <textarea
              placeholder="Ghi chú"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full p-3 border rounded"
            />

            <button className="w-full bg-orange-500 text-white py-3 rounded">
              Đặt lịch
            </button>

          </form>
        </div>
      </section>
    </>
  );
}