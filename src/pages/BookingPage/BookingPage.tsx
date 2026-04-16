// BookingPage.tsx
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Home,
  Mail,
  MapPin,
  Send,
  Store,
  Syringe,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PetAPI, { type Pet } from '../../services/PetAPI';
import { appointmentService } from '../../services/AppointmentService';
import { healthRecordService } from '../../services/HealthRecordService';
import type { AppointmentCatalogService } from '../../types/appointment';
import type { VaccinationReminderStatus } from '../../types/healthRecord';
import { incrementAppointmentBadgeCount } from '../../utils/appointmentBadgeStorage';
import styles from './BookingPage.module.css';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const today = new Date().toISOString().split('T')[0];

function addMinutesToTimeSlot(timeHhMm: string, addMinutes: number): string {
  const [h, m] = timeHhMm.split(':').map(Number);
  let totalMin = h * 60 + m + addMinutes;
  totalMin %= 24 * 60;
  if (totalMin < 0) totalMin += 24 * 60;
  const eh = Math.floor(totalMin / 60);
  const em = totalMin % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reminderSource = searchParams.get('source') ?? '';
  const reminderPetId = searchParams.get('petId') ?? '';
  const reminderVaccinationId = searchParams.get('vaccinationId') ?? '';
  const reminderVaccineName = searchParams.get('vaccine') ?? '';
  const isVaccinationReminderFlow = reminderSource === 'vaccination_reminder'
    && reminderPetId.length > 0
    && reminderVaccinationId.length > 0;

  const [services, setServices] = useState<AppointmentCatalogService[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    serviceId: '',
    petId: '',
    appointmentType: 'at_store' as 'at_store' | 'at_home',
    serviceAddress: '',
    date: '',
    time: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [reminderActionLoading, setReminderActionLoading] = useState<VaccinationReminderStatus | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCatalog(true);
        const [svcList, petList] = await Promise.all([
          appointmentService.getServices(),
          PetAPI.getActivePets().catch(() => [] as Pet[]),
        ]);
        setServices(svcList ?? []);
        setPets(petList ?? []);
      } catch {
        toast.error('Không tải được danh sách dịch vụ. Vui lòng thử lại sau.');
        setServices([]);
      } finally {
        setLoadingCatalog(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isVaccinationReminderFlow) {
      return;
    }

    setForm((prev) => {
      const shouldSetPet = reminderPetId && !prev.petId;
      const shouldSetNote = reminderVaccineName && !prev.notes.trim();

      if (!shouldSetPet && !shouldSetNote) {
        return prev;
      }

      return {
        ...prev,
        petId: shouldSetPet ? reminderPetId : prev.petId,
        notes: shouldSetNote
          ? `Nhắc lịch tiêm vaccine ${reminderVaccineName} theo email reminder.`
          : prev.notes,
      };
    });
  }, [isVaccinationReminderFlow, reminderPetId, reminderVaccineName]);

  const handleReminderStatus = async (status: VaccinationReminderStatus) => {
    if (!isVaccinationReminderFlow) {
      return;
    }

    if (!localStorage.getItem('authToken')) {
      toast.error('Vui lòng đăng nhập để cập nhật trạng thái nhắc lịch tiêm.');
      navigate('/dang-nhap');
      return;
    }

    try {
      setReminderActionLoading(status);
      await healthRecordService.updateVaccinationReminderStatus(
        reminderPetId,
        reminderVaccinationId,
        status,
        'Updated from booking reminder deep-link'
      );

      const messageByStatus: Record<VaccinationReminderStatus, string> = {
        booked: 'Đã đánh dấu: đã đặt lịch tiêm.',
        done: 'Đã đánh dấu: đã tiêm xong.',
        remind_later: 'Đã đánh dấu: nhắc lại sau.',
      };

      toast.success(messageByStatus[status]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái nhắc lịch.');
    } finally {
      setReminderActionLoading(null);
    }
  };

  const validate = () => {
    const errs: Partial<Record<keyof typeof form, string>> = {};
    if (!form.serviceId) errs.serviceId = 'Vui lòng chọn dịch vụ';
    if (!form.date) errs.date = 'Vui lòng chọn ngày';
    if (!form.time) errs.time = 'Vui lòng chọn giờ';
    if (!form.notes.trim()) errs.notes = 'Vui lòng nhập ghi chú / lý do';
    if (form.appointmentType === 'at_home' && !form.serviceAddress.trim()) {
      errs.serviceAddress = 'Vui lòng nhập địa chỉ khi chọn dịch vụ tại nhà';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('authToken')) {
      toast.error('Vui lòng đăng nhập để đặt lịch.');
      navigate('/dang-nhap');
      return;
    }
    if (!validate()) return;

    const svc = services.find((s) => s.id === form.serviceId);
    if (!svc) {
      toast.error('Dịch vụ không hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      const when = new Date(`${form.date}T${form.time}:00`);
      const startTime = `${form.time}:00`;
      const endTime = addMinutesToTimeSlot(form.time, svc.durationMinutes);

      await appointmentService.createAppointment({
        serviceId: form.serviceId,
        ...(form.petId ? { petId: form.petId } : {}),
        appointmentType: form.appointmentType,
        appointmentDate: when.toISOString(),
        startTime,
        endTime,
        ...(form.appointmentType === 'at_home' && form.serviceAddress.trim()
          ? { serviceAddress: form.serviceAddress.trim() }
          : {}),
        notes: form.notes.trim(),
      });
      incrementAppointmentBadgeCount();
      toast.success('Đặt lịch thành công! 🐾');
      setForm({
        serviceId: '',
        petId: '',
        appointmentType: 'at_store',
        serviceAddress: '',
        date: '',
        time: '',
        notes: '',
      });
      setErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đặt lịch thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === form.serviceId);

  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={`${styles.blob} ${styles.blobC}`} />
      </div>

      <section className={styles.hero}>
        <div className={styles.pawsLayer} aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={styles.floatPaw} style={{
              left: `${8 + i * 13}%`,
              animationDelay: `${i * 0.85}s`,
              animationDuration: `${5 + (i % 3)}s`,
              fontSize: `${12 + (i % 3) * 5}px`,
            }}>🐾</span>
          ))}
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Đặt lịch hẹn</span>
          <h1 className={styles.heroTitle}>
            Đặt lịch chăm sóc<br />
            <span className={styles.heroAccent}>thú cưng 🐾</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Chọn dịch vụ và thời gian phù hợp — đội ngũ luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.formWrap}>
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            Quay lại
          </button>

          <form onSubmit={handleSubmit} className={styles.card} noValidate>
            <div className={styles.cardHeader}>
              <Calendar size={18} className={styles.cardHeaderIcon} />
              <h2 className={styles.cardTitle}>Thông tin đặt lịch</h2>
            </div>

            {isVaccinationReminderFlow && (
              <div className={styles.reminderBox}>
                <Syringe size={15} className={styles.reminderIcon} />
                <div style={{ width: '100%' }}>
                  <p className={styles.reminderText}>
                    Bạn đang mở từ email nhắc tiêm vaccine {reminderVaccineName ? <strong>{reminderVaccineName}</strong> : null}.
                  </p>
                  <div className={styles.timeGrid} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginTop: 10 }}>
                    <button
                      type="button"
                      className={styles.timeSlot}
                      onClick={() => handleReminderStatus('booked')}
                      disabled={reminderActionLoading !== null}
                    >
                      Đã đặt lịch
                    </button>
                    <button
                      type="button"
                      className={styles.timeSlot}
                      onClick={() => handleReminderStatus('done')}
                      disabled={reminderActionLoading !== null}
                    >
                      Đã tiêm xong
                    </button>
                    <button
                      type="button"
                      className={styles.timeSlot}
                      onClick={() => handleReminderStatus('remind_later')}
                      disabled={reminderActionLoading !== null}
                    >
                      Nhắc lại sau
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                <Store size={13} />
                Dịch vụ <span className={styles.req}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={`${styles.select} ${errors.serviceId ? styles.inputError : ''}`}
                  value={form.serviceId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, serviceId: e.target.value }));
                    setErrors((er) => ({ ...er, serviceId: undefined }));
                  }}
                  disabled={loadingCatalog}
                >
                  <option value="">{loadingCatalog ? 'Đang tải...' : 'Chọn dịch vụ'}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName}
                      {s.categoryName ? ` — ${s.categoryName}` : ''}
                      {typeof s.price === 'number' ? ` (${s.price.toLocaleString('vi-VN')}đ)` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles.selectChevron} />
              </div>
              {errors.serviceId && <p className={styles.errMsg}>{errors.serviceId}</p>}
            </div>

            {selectedService && (
              <div className={styles.doctorPreview}>
                <div className={styles.doctorAvatar}>{selectedService.serviceName.charAt(0)}</div>
                <div>
                  <p className={styles.doctorPreviewName}>{selectedService.serviceName}</p>
                  <p className={styles.doctorPreviewSpec}>
                    {selectedService.durationMinutes} phút
                    {selectedService.isHomeService ? ' · Có thể tại nhà' : ''}
                  </p>
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar size={13} />
                Hình thức <span className={styles.req}>*</span>
              </label>
              <div className={styles.timeGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button
                  type="button"
                  className={`${styles.timeSlot} ${form.appointmentType === 'at_store' ? styles.timeSlotActive : ''}`}
                  onClick={() => setForm((f) => ({ ...f, appointmentType: 'at_store' }))}
                >
                  <Store size={14} /> Tại cửa hàng
                </button>
                <button
                  type="button"
                  className={`${styles.timeSlot} ${form.appointmentType === 'at_home' ? styles.timeSlotActive : ''}`}
                  onClick={() => setForm((f) => ({ ...f, appointmentType: 'at_home' }))}
                  disabled={selectedService != null && !selectedService.isHomeService}
                  title={selectedService && !selectedService.isHomeService ? 'Dịch vụ này không hỗ trợ tại nhà' : undefined}
                >
                  <Home size={14} /> Tại nhà
                </button>
              </div>
            </div>

            {form.appointmentType === 'at_home' && (
              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin size={13} />
                  Địa chỉ <span className={styles.req}>*</span>
                </label>
                <textarea
                  className={`${styles.input} ${styles.textarea} ${errors.serviceAddress ? styles.inputError : ''}`}
                  value={form.serviceAddress}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, serviceAddress: e.target.value }));
                    setErrors((er) => ({ ...er, serviceAddress: undefined }));
                  }}
                  placeholder="Số nhà, đường, phường..."
                  rows={2}
                />
                {errors.serviceAddress && <p className={styles.errMsg}>{errors.serviceAddress}</p>}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar size={13} />
                Thú cưng (tuỳ chọn)
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={form.petId}
                  onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
                  disabled={loadingCatalog}
                >
                  <option value="">— Không chọn —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>{p.petName}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles.selectChevron} />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={13} />
                  Ngày <span className={styles.req}>*</span>
                </label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                  value={form.date}
                  min={today}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, date: e.target.value }));
                    setErrors((er) => ({ ...er, date: undefined }));
                  }}
                />
                {errors.date && <p className={styles.errMsg}>{errors.date}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Clock size={13} />
                  Giờ <span className={styles.req}>*</span>
                </label>
                <div className={styles.timeGrid}>
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`${styles.timeSlot} ${form.time === slot ? styles.timeSlotActive : ''}`}
                      onClick={() => {
                        setForm((f) => ({ ...f, time: slot }));
                        setErrors((er) => ({ ...er, time: undefined }));
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.time && <p className={styles.errMsg}>{errors.time}</p>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <FileText size={13} />
                Ghi chú / lý do <span className={styles.req}>*</span>
              </label>
              <textarea
                className={`${styles.input} ${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
                value={form.notes}
                onChange={(e) => {
                  setForm((f) => ({ ...f, notes: e.target.value }));
                  setErrors((er) => ({ ...er, notes: undefined }));
                }}
                placeholder="Mô tả nhu cầu hoặc triệu chứng..."
                rows={4}
              />
              {errors.notes && <p className={styles.errMsg}>{errors.notes}</p>}
            </div>

            <div className={styles.reminderBox}>
              <Mail size={15} className={styles.reminderIcon} />
              <p className={styles.reminderText}>
                Bạn sẽ nhận <strong>email nhắc lịch</strong> trước 1 giờ tự động (nếu hệ thống bật).
              </p>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (
                <span className={styles.submittingDots}>Đang xử lý<span>...</span></span>
              ) : (
                <><Send size={16} /> Đặt lịch ngay 🐾</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
