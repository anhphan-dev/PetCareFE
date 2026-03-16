import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, ClipboardList, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService, type AppointmentResponse } from '../../services/AppointmentService';

const STATUSES = [
  { value: '',            label: 'Tất cả' },
  { value: 'pending',     label: 'Chờ xác nhận' },
  { value: 'confirmed',   label: 'Đã xác nhận' },
  { value: 'in-progress', label: 'Đang khám' },
  { value: 'completed',   label: 'Hoàn thành' },
  { value: 'cancelled',   label: 'Đã huỷ' },
];

const NEXT_STATUSES: Record<string, Array<{ value: string; label: string }>> = {
  pending:      [{ value: 'confirmed', label: 'Xác nhận' }, { value: 'cancelled', label: 'Huỷ' }],
  confirmed:    [{ value: 'in-progress', label: 'Bắt đầu khám' }, { value: 'cancelled', label: 'Huỷ' }],
  'in-progress':[{ value: 'completed', label: 'Hoàn thành' }, { value: 'cancelled', label: 'Huỷ' }],
  completed:    [],
  cancelled:    [],
};

const STATUS_COLOR: Record<string, string> = {
  pending:       'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:     'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
  completed:     'bg-green-100 text-green-700 border-green-200',
  cancelled:     'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  pending:       'Chờ xác nhận',
  confirmed:     'Đã xác nhận',
  'in-progress': 'Đang khám',
  completed:     'Hoàn thành',
  cancelled:     'Đã huỷ',
};

const TYPE_LABEL: Record<string, string> = {
  clinic: 'Phòng khám',
  home:   'Tại nhà',
  spa:    'Spa',
  dental: 'Răng miệng',
};

export default function DoctorDashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selected, setSelected] = useState<AppointmentResponse | null>(null);

  // Form state for updating selected appointment
  const [nextStatus, setNextStatus] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const isDoctor = user?.roleName === 'Doctor' || user?.roleName === 'Admin';

  useEffect(() => {
    if (!isLoggedIn || !isDoctor) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isDoctor]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAllAppointments(
        filterStatus || undefined,
        filterDate || undefined,
      );
      setAppointments(data);
    } catch {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const openDetail = (apt: AppointmentResponse) => {
    setSelected(apt);
    setNextStatus('');
    setMedicalNotes('');
    setCancelReason('');
  };

  const handleUpdate = async () => {
    if (!selected || !nextStatus) return;
    setUpdating(true);
    try {
      const updated = await AppointmentService.updateStatus(selected.id, {
        status: nextStatus,
        medicalNotes: medicalNotes || undefined,
        cancellationReason: nextStatus === 'cancelled' ? cancelReason || undefined : undefined,
      });
      setAppointments((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      setSelected(updated);
      setNextStatus('');
      setMedicalNotes('');
      setCancelReason('');
      toast.success('Cập nhật trạng thái thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatTime = (t: string) => t?.slice(0, 5) ?? '';

  const nextActions = selected ? (NEXT_STATUSES[selected.appointmentStatus] ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-teal-600" />
            <h1 className="text-xl font-bold text-gray-800">Quản lý lịch hẹn</h1>
          </div>
          <span className="text-sm text-gray-500">Xin chào, {user?.fullName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* LEFT: List */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <form onSubmit={handleFilter} className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Filter className="inline w-3.5 h-3.5 mr-0.5" />Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="inline w-3.5 h-3.5 mr-0.5" />Ngày
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Lọc
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus(''); setFilterDate(''); setTimeout(fetchAppointments, 0); }}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Xoá bộ lọc
            </button>
          </form>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Đang tải...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => openDetail(apt)}
                  className={`w-full text-left bg-white rounded-xl border p-4 hover:border-teal-400 transition-colors ${
                    selected?.id === apt.id ? 'border-teal-500 shadow-md' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[apt.appointmentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABEL[apt.appointmentStatus] ?? apt.appointmentStatus}
                        </span>
                        <span className="text-xs text-gray-400">{TYPE_LABEL[apt.appointmentType] ?? apt.appointmentType}</span>
                      </div>
                      <p className="font-semibold text-gray-800 truncate">{apt.userName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {apt.serviceName ?? apt.appointmentType}
                        {apt.petName ? ` · ${apt.petName}` : ''}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 shrink-0">
                      <p>{formatDate(apt.appointmentDate)}</p>
                      <p>{formatTime(apt.startTime)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Detail panel */}
        {selected && (
          <div className="w-96 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-bold text-gray-800 text-lg">Chi tiết lịch hẹn</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>

              {/* Patient & pet */}
              <div className="space-y-2 text-sm mb-5">
                <Row label="Khách hàng" value={selected.userName} />
                {selected.petName && <Row label="Thú cưng" value={selected.petName} />}
                <Row label="Dịch vụ" value={selected.serviceName ?? '-'} />
                <Row label="Loại hình" value={TYPE_LABEL[selected.appointmentType] ?? selected.appointmentType} />
                <Row label="Ngày" value={formatDate(selected.appointmentDate)} />
                <Row label="Giờ" value={`${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`} />
                {selected.serviceAddress && <Row label="Địa chỉ" value={selected.serviceAddress} />}
                <Row
                  label="Trạng thái"
                  value={
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[selected.appointmentStatus]}`}>
                      {STATUS_LABEL[selected.appointmentStatus]}
                    </span>
                  }
                />
                {selected.assignedStaffName && <Row label="Bác sĩ" value={selected.assignedStaffName} />}
              </div>

              {/* Original customer notes */}
              {selected.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Ghi chú từ khách hàng</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              {/* Cancellation reason */}
              {selected.cancellationReason && (
                <div className="bg-red-50 rounded-lg p-3 mb-5">
                  <p className="text-xs font-semibold text-red-500 mb-1">Lý do huỷ</p>
                  <p className="text-sm text-red-700">{selected.cancellationReason}</p>
                </div>
              )}

              {/* Update section — only if there are next actions */}
              {nextActions.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                    <ChevronDown className="w-4 h-4" />Cập nhật trạng thái
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {nextActions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => setNextStatus(action.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          nextStatus === action.value
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'border-gray-300 text-gray-700 hover:border-teal-400 hover:text-teal-600'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>

                  {nextStatus && nextStatus !== 'cancelled' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Ghi chú y tế / tình trạng thú cưng
                      </label>
                      <textarea
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                        rows={4}
                        placeholder="Nhập triệu chứng, chẩn đoán, thuốc điều trị, hướng dẫn chăm sóc..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                      />
                    </div>
                  )}

                  {nextStatus === 'cancelled' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Lý do huỷ</label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ví dụ: Bác sĩ bận, cơ sở đóng cửa..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none"
                      />
                    </div>
                  )}

                  {nextStatus && (
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors disabled:opacity-60"
                    >
                      {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 shrink-0 w-28">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
