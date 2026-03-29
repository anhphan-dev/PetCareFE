import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/AppointmentService';
import { AppointmentResponse } from '../../types/appointment';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HealthRecordModal from './HealthRecordModal';

export default function ProviderDashBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{appId: string, petId: string} | null>(null);

  useEffect(() => {
    // If not logged in or not a provider/admin, handle accordingly.
    // Assuming simple check.
    if (!user) {
      toast.warning('Vui lòng đăng nhập!');
      navigate('/dang-nhap');
      return;
    }
    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const approveAppointment = async (id: string) => {
    try {
      await appointmentService.updateStatus(id, { status: 'confirmed' });
      toast.success('Đã duyệt lịch hẹn!');
      fetchAppointments();
      // TODO: Notify user 
    } catch (err) {
      toast.error('Lỗi khi duyệt lịch hẹn');
    }
  };

  const cancelAppointmentFlow = async (id: string) => {
    const reason = window.prompt('Nhập lý do hủy:');
    if (reason === null) return;
    try {
      await appointmentService.updateStatus(id, {
        status: 'cancelled',
        cancellationReason: reason || 'Bác sĩ bận việc đột xuất',
      });
      toast.success('Đã hủy lịch hẹn!');
      fetchAppointments();
    } catch (err) {
      toast.error('Lỗi khi hủy lịch hẹn');
    }
  };

  // Helper render timespan or string
  const renderTime = (timePayload: any) => {
    if (!timePayload) return '';
    if (typeof timePayload === 'string') return timePayload;
    if (timePayload.ticks !== undefined) {
      // rough convert from ticks to hh:mm
      const totalSeconds = Math.floor(timePayload.ticks / 10000000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    return 'N/A';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1"><Clock size={14}/> Chờ duyệt</span>;
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1"><CheckCircle size={14}/> Đã duyệt</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Đang khám</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Hoàn thành</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1"><XCircle size={14}/> Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">{status || 'N/A'}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl mt-20">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý lịch hẹn (Doctor)</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giờ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại lịch</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Chưa có lịch hẹn nào.</td>
                </tr>
              ) : (
                appointments.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(app.appointmentDate).toLocaleDateString('vi-VN')} <br/>
                      <span className="text-gray-500 font-normal">{renderTime(app.startTime)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.appointmentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.serviceAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {app.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.appointmentStatus || app.status || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(app.appointmentStatus === 'pending' || app.status === 'pending' || (!app.appointmentStatus && !app.status)) && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveAppointment(app.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors"
                          >Duyệt</button>
                          <button 
                            onClick={() => cancelAppointmentFlow(app.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors"
                          >Từ chối</button>
                        </div>
                      )}
                      {(app.appointmentStatus === 'confirmed' || app.status === 'confirmed') && (
                        <div className="flex gap-2">
                           <button 
                            onClick={() => {
                              setSelectedApp({ appId: app.id, petId: app.petId });
                              setModalOpen(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                          >Khám xong</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {modalOpen && selectedApp && (
        <HealthRecordModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          appointmentId={selectedApp.appId}
          petId={selectedApp.petId}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
}
