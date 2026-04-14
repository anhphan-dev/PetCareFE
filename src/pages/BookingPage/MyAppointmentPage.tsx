// MyAppointmentsPage.tsx
import {
    Bell,
    CalendarDays,
    ChevronRight,
    Clock,
    FileText,
    RefreshCw,
    X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { clearAppointmentBadgeForCurrentUser } from '../../utils/appointmentBadgeStorage';
import {
  appointmentService,
  formatAppointmentCalendarDate,
  formatAppointmentTime,
} from '../../services/AppointmentService';
import type { AppointmentResponse } from '../../types/appointment';
import styles from './MyAppointmentPage.module.css';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

type FilterType = 'ALL' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL',       label: '🐾 Tất cả' },
  { key: 'Pending',   label: '⏳ Chờ xác nhận' },
  { key: 'Confirmed', label: '✅ Đã xác nhận' },
  { key: 'Completed', label: '✔ Hoàn thành' },
  { key: 'Cancelled', label: '✕ Đã hủy' },
];

function getStatusVariant(status: Appointment['status']) {
  switch (status) {
    case 'Pending':   return 'pending';
    case 'Confirmed': return 'confirmed';
    case 'Completed': return 'completed';
    case 'Cancelled': return 'cancelled';
  }
}

function getStatusLabel(status: Appointment['status']) {
  switch (status) {
    case 'Pending':   return '⏳ Chờ xác nhận';
    case 'Confirmed': return '✅ Đã xác nhận';
    case 'Completed': return '✔ Hoàn thành';
    case 'Cancelled': return '✕ Đã hủy';
  }
}

function mapApiStatusToMyUi(s: string | undefined): Appointment['status'] {
  const v = (s || 'pending').toLowerCase();
  if (v === 'pending') return 'Pending';
  if (v === 'confirmed' || v === 'in-progress') return 'Confirmed';
  if (v === 'completed') return 'Completed';
  if (v === 'cancelled') return 'Cancelled';
  return 'Pending';
}

function mapResponseToAppointment(a: AppointmentResponse): Appointment {
  const serviceTitle = a.serviceName?.trim() || 'Dịch vụ';
  return {
    id: a.id,
    doctorId: a.assignedStaffId || a.serviceId || '',
    doctorName: serviceTitle,
    date: formatAppointmentCalendarDate(a.appointmentDate),
    time: formatAppointmentTime(a.startTime),
    reason: (a.notes || '').trim() || '—',
    status: mapApiStatusToMyUi(a.appointmentStatus || a.status),
    createdAt: a.createdAt || '',
  };
}

/* Returns minutes until appointment. Negative = past */
function minutesUntil(date: string, time: string) {
  const [h, m] = time.split(':').map(Number);
  const apptDate = new Date(date);
  apptDate.setHours(h, m, 0, 0);
  return (apptDate.getTime() - Date.now()) / 60000;
}

function CountdownBadge({ date, time }: { date: string; time: string }) {
  const mins = minutesUntil(date, time);
  if (mins <= 0 || mins > 24 * 60) return null;
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const label = h > 0 ? `Còn ${h} giờ ${m} phút nữa` : `Còn ${m} phút nữa`;
  return <span className={styles.countdown}><Clock size={12} /> {label}</span>;
}

function ReminderBadge({ date, time }: { date: string; time: string }) {
  const mins = minutesUntil(date, time);
  if (mins > 0 && mins <= 60) {
    return <span className={styles.reminderBadge}><Bell size={12} /> Đã gửi nhắc nhở</span>;
  }
  return null;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  /* ── fetch ── */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments();
      setAppointments((data ?? []).map(mapResponseToAppointment));
    } catch {
      toast.error('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearAppointmentBadgeForCurrentUser();
    fetchAppointments();
  }, []);

  /* ── cancel ── */
  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    try {
      setCancellingId(id);
      await appointmentService.cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
      toast.success('Đã hủy lịch hẹn.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy lịch.');
    } finally {
      setCancellingId(null);
    }
  };

  /* ── filtered list ── */
  const filtered = useMemo(() =>
    filter === 'ALL'
      ? appointments
      : appointments.filter(a => a.status === filter),
    [appointments, filter]
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
      </div>

      <div className={styles.container}>
        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Lịch hẹn của bạn 🐾</h1>
            <p className={styles.pageSubtitle}>Quản lý và theo dõi tất cả lịch khám thú cưng</p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchAppointments} disabled={loading} aria-label="Tải lại">
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          </button>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsRow}>
          {[
            { label: 'Tất cả',    count: appointments.length,                         variant: 'all' },
            { label: 'Chờ xác nhận', count: appointments.filter(a=>a.status==='Pending').length,   variant: 'pending' },
            { label: 'Đã xác nhận', count: appointments.filter(a=>a.status==='Confirmed').length, variant: 'confirmed' },
            { label: 'Hoàn thành', count: appointments.filter(a=>a.status==='Completed').length,  variant: 'completed' },
          ].map(s => (
            <div key={s.label} className={`${styles.statCard} ${styles[`statCard_${s.variant}`]}`}>
              <span className={styles.statCount}>{s.count}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div className={styles.filterBarWrap}>
          <nav className={styles.filterBar}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className={styles.filterCount}>
                  {f.key === 'ALL' ? appointments.length : appointments.filter(a => a.status === f.key).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className={styles.loadingState}>
            <span className={styles.loadingPaw}>🐾</span>
            <p>Đang tải lịch hẹn...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🐾</span>
            <h3 className={styles.emptyTitle}>Không có lịch hẹn nào</h3>
            <p className={styles.emptyText}>
              {filter === 'ALL'
                ? 'Bạn chưa có lịch hẹn nào. Hãy đặt lịch ngay!'
                : `Không có lịch hẹn nào ở trạng thái "${FILTERS.find(f => f.key === filter)?.label}".`}
            </p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {filtered.map((appt, i) => {
              const variant = getStatusVariant(appt.status);
              return (
                <div
                  key={appt.id}
                  className={`${styles.apptCard} ${styles[`apptCard_${variant}`]}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Status strip */}
                  <div className={`${styles.statusStrip} ${styles[`strip_${variant}`]}`} />

                  <div className={styles.apptCardInner}>
                    {/* Top row */}
                    <div className={styles.apptTop}>
                      <div className={styles.apptMeta}>
                        <div className={styles.apptDoctor}>
                          <div className={styles.doctorAvatar}>{appt.doctorName.charAt(0)}</div>
                          <span className={styles.doctorName}>{appt.doctorName}</span>
                        </div>
                        <div className={styles.metaRow}>
                          <span className={styles.metaItem}>
                            <CalendarDays size={13} />
                            {formatDate(appt.date)}
                          </span>
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.metaItem}>
                            <Clock size={13} />
                            {appt.time}
                          </span>
                        </div>
                      </div>

                      <div className={styles.apptRight}>
                        <span className={`${styles.statusBadge} ${styles[`badge_${variant}`]}`}>
                          {getStatusLabel(appt.status)}
                        </span>
                        <ReminderBadge date={appt.date} time={appt.time} />
                        {appt.status === 'Confirmed' && (
                          <CountdownBadge date={appt.date} time={appt.time} />
                        )}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className={styles.reasonBox}>
                      <FileText size={13} className={styles.reasonIcon} />
                      <p className={styles.reasonText}>{appt.reason}</p>
                    </div>

                    {/* Actions */}
                    {appt.status === 'Pending' && (
                      <div className={styles.actions}>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancellingId === appt.id}
                        >
                          <X size={14} />
                          {cancellingId === appt.id ? 'Đang hủy...' : 'Hủy lịch'}
                        </button>
                      </div>
                    )}

                    {appt.status === 'Confirmed' && (
                      <div className={styles.confirmedInfo}>
                        <ChevronRight size={13} className={styles.confirmedChevron} />
                        <span>Lịch đã được xác nhận — hãy đến đúng giờ nhé!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}