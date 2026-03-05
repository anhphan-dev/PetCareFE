import { useState } from 'react';
import {
  Calendar,
  Clock,
  Dog,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  StickyNote,
  User,
  CheckCircle2,
} from 'lucide-react';

type BookingStatus = 'pending' | 'in_progress' | 'done';

interface Booking {
  id: string;
  petName: string;
  ownerName: string;
  serviceName: string;
  date: string;
  time: string;
  address?: string;
  status: BookingStatus;
}

export default function ProviderAppointmentsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examNote, setExamNote] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: thay bằng API dành cho service_provider
  const bookings: Booking[] = [
    {
      id: '1',
      petName: 'Milu',
      ownerName: 'Nguyễn Văn A',
      serviceName: 'Khám sức khỏe định kỳ',
      date: '2026-02-27',
      time: '09:00',
      address: '123 Đường ABC, Q.1',
      status: 'pending',
    },
    {
      id: '2',
      petName: 'Nana',
      ownerName: 'Trần Thị B',
      serviceName: 'Thẩm mỹ / Spa',
      date: '2026-02-27',
      time: '10:30',
      status: 'in_progress',
    },
  ];

  const selected = bookings.find((b) => b.id === selectedId) || bookings[0];

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    // TODO: gọi API lưu thông tin khám cho thú cưng (ví dụ /api/PetExams)
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lịch dịch vụ & khám thú cưng</h1>
            <p className="text-sm text-gray-500">
              Xem các dịch vụ đã được khách đặt và ghi nhận thông tin khám cho từng thú cưng.
            </p>
          </div>
        </header>

        <main className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-6">
          {/* Danh sách lịch dịch vụ */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Lịch dịch vụ hôm nay
              </h2>
              <span className="text-xs text-gray-500">{bookings.length} lịch</span>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left p-4 rounded-xl border text-sm flex items-start justify-between gap-3 ${
                    selected?.id === b.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-50 text-orange-500">
                        <Dog className="w-4 h-4" />
                      </span>
                      <span className="font-semibold text-gray-800">{b.petName}</span>
                      <span className="text-xs text-gray-500">({b.ownerName})</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        <span>{b.serviceName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {b.time} • {b.date}
                        </span>
                      </div>
                      {b.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{b.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      b.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : b.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {b.status === 'pending'
                      ? 'Chờ khám'
                      : b.status === 'in_progress'
                      ? 'Đang khám'
                      : 'Đã hoàn thành'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Form khám bệnh */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            {selected ? (
              <form onSubmit={handleSaveExam} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-teal-600">
                      <Stethoscope className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base md:text-lg font-semibold text-gray-800">
                        Khám cho {selected.petName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Chủ nuôi: {selected.ownerName} • {selected.serviceName}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      <span>{selected.date}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{selected.time}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-teal-600" />
                    <span>{selected.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-teal-600" />
                    <span>0123 456 789</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-teal-600" />
                    <span>email@customer.com</span>
                  </div>
                  {selected.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      <span className="truncate">{selected.address}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi nhận tình trạng lúc khám
                  </label>
                  <textarea
                    value={examNote}
                    onChange={(e) => setExamNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                    placeholder="Ví dụ: thân nhiệt 39°C, nhịp tim, trạng thái ăn uống, hành vi..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chẩn đoán
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      placeholder="Chẩn đoán sơ bộ / cuối cùng..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hướng dẫn & toa thuốc
                    </label>
                    <textarea
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      placeholder="Loại thuốc, liều dùng, lịch tái khám..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
                  >
                    {loading ? (
                      <StickyNote className="w-4 h-4 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Lưu thông tin khám
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExamNote('');
                      setDiagnosis('');
                      setAdvice('');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Xóa nội dung
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Chọn một lịch dịch vụ bên trái để bắt đầu khám.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

