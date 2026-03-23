import { useState } from 'react';
import { toast } from 'react-toastify';
import { healthRecordService } from '../../services/HealthRecordService';
import { appointmentService } from '../../services/AppointmentService';

interface HealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  petId: string;
  onSuccess: () => void;
}

export default function HealthRecordModal({ isOpen, onClose, appointmentId, petId, onSuccess }: HealthRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    treatment: '',
    medication: '',
    notes: '',
    followUpDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.diagnosis) {
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Tạo sổ theo dõi
      await healthRecordService.createHealthRecord({
        appointmentId,
        petId,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        medication: form.medication,
        notes: form.notes,
        followUpDate: form.followUpDate || undefined,
      });

      // 2. Chuyển trạng thái appointment sang Completed
      await appointmentService.updateStatus(appointmentId, { status: 'Completed', medicalNotes: form.notes });
      
      toast.success('Lưu sổ theo dõi và hoàn thành khám bệnh!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu sổ theo dõi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Cập nhật Sổ theo dõi (Health Record)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán *</label>
            <input 
              type="text" 
              value={form.diagnosis}
              onChange={e => setForm({...form, diagnosis: e.target.value})}
              required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hướng điều trị</label>
            <textarea 
              value={form.treatment}
              onChange={e => setForm({...form, treatment: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn thuốc (Medication)</label>
            <textarea 
              value={form.medication}
              onChange={e => setForm({...form, medication: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tái khám (Tùy chọn)</label>
            <input 
              type="date" 
              value={form.followUpDate}
              onChange={e => setForm({...form, followUpDate: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
            <textarea 
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-white bg-teal-500 hover:bg-teal-600 rounded disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang lưu...' : 'Lưu & Hoàn thành'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
