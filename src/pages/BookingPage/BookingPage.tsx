// BookingPage.tsx
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  Send,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services/AppointmentService';
import styles from './BookingPage.module.css';

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const today = new Date().toISOString().split('T')[0];

export default function BookingPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  /* ── fetch doctor list ── */
  useEffect(() => {
    (async () => {
      try {
        setLoadingDoctors(true);
        const list = await appointmentService.getDoctors?.() ?? [];
        setDoctors(list);
      } catch {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    })();
  }, []);

  /* ── validation ── */
  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.doctorId)  errs.doctorId = 'Vui lòng chọn bác sĩ';
    if (!form.date)      errs.date = 'Vui lòng chọn ngày';
    if (!form.time)      errs.time = 'Vui lòng chọn giờ';
    if (!form.reason.trim()) errs.reason = 'Vui lòng nhập lý do khám';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await appointmentService.createAppointment({
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        reason: form.reason.trim(),
      });
      toast.success('Đặt lịch thành công! 🐾');
      setForm({ doctorId: '', date: '', time: '', reason: '' });
      setErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đặt lịch thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === form.doctorId);

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={`${styles.blob} ${styles.blobC}`} />
      </div>

      {/* ── HERO ── */}
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
            Chọn thời gian phù hợp cho bé — đội ngũ bác sĩ tận tâm luôn sẵn sàng.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* ── FORM CARD ── */}
        <div className={styles.formWrap}>
          {/* Back link */}
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            Quay lại
          </button>

          <form onSubmit={handleSubmit} className={styles.card} noValidate>
            <div className={styles.cardHeader}>
              <Calendar size={18} className={styles.cardHeaderIcon} />
              <h2 className={styles.cardTitle}>Thông tin đặt lịch</h2>
            </div>

            {/* Doctor */}
            <div className={styles.field}>
              <label className={styles.label}>
                <User size={13} />
                Bác sĩ <span className={styles.req}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={`${styles.select} ${errors.doctorId ? styles.inputError : ''}`}
                  value={form.doctorId}
                  onChange={(e) => { setForm(f => ({ ...f, doctorId: e.target.value })); setErrors(er => ({ ...er, doctorId: '' })); }}
                  disabled={loadingDoctors}
                >
                  <option value="">{loadingDoctors ? 'Đang tải...' : 'Chọn bác sĩ'}</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}{d.specialty ? ` — ${d.specialty}` : ''}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles.selectChevron} />
              </div>
              {errors.doctorId && <p className={styles.errMsg}>{errors.doctorId}</p>}
            </div>

            {/* Selected doctor card */}
            {selectedDoctor && (
              <div className={styles.doctorPreview}>
                <div className={styles.doctorAvatar}>{selectedDoctor.name.charAt(0)}</div>
                <div>
                  <p className={styles.doctorPreviewName}>{selectedDoctor.name}</p>
                  {selectedDoctor.specialty && <p className={styles.doctorPreviewSpec}>{selectedDoctor.specialty}</p>}
                </div>
              </div>
            )}

            {/* Date + Time */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={13} />
                  Ngày khám <span className={styles.req}>*</span>
                </label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                  value={form.date}
                  min={today}
                  onChange={(e) => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: '' })); }}
                />
                {errors.date && <p className={styles.errMsg}>{errors.date}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Clock size={13} />
                  Giờ khám <span className={styles.req}>*</span>
                </label>
                <div className={styles.timeGrid}>
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`${styles.timeSlot} ${form.time === slot ? styles.timeSlotActive : ''}`}
                      onClick={() => { setForm(f => ({ ...f, time: slot })); setErrors(er => ({ ...er, time: '' })); }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.time && <p className={styles.errMsg}>{errors.time}</p>}
              </div>
            </div>

            {/* Reason */}
            <div className={styles.field}>
              <label className={styles.label}>
                <FileText size={13} />
                Lý do khám <span className={styles.req}>*</span>
              </label>
              <textarea
                className={`${styles.input} ${styles.textarea} ${errors.reason ? styles.inputError : ''}`}
                value={form.reason}
                onChange={(e) => { setForm(f => ({ ...f, reason: e.target.value })); setErrors(er => ({ ...er, reason: '' })); }}
                placeholder="Mô tả triệu chứng hoặc lý do muốn khám..."
                rows={4}
              />
              {errors.reason && <p className={styles.errMsg}>{errors.reason}</p>}
            </div>

            {/* Email reminder info */}
            <div className={styles.reminderBox}>
              <Mail size={15} className={styles.reminderIcon} />
              <p className={styles.reminderText}>
                Bạn sẽ nhận <strong>email nhắc lịch</strong> trước 1 giờ tự động.
              </p>
            </div>

            {/* Submit */}
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