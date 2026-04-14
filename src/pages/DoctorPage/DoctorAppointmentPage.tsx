// DoctorAppointmentsPage.tsx
import {
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  PlayCircle,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService, type DoctorAppointmentRow } from '../../services/AppointmentService';
import styles from './DoctorAppointmentPage.module.css';

type FilterType = 'ALL' | DoctorAppointmentRow['status'];

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ xác nhận' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'InProgress', label: 'Đang TH' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
];

const today = new Date().toISOString().split('T')[0];

function minutesUntil(date: string, time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return (d.getTime() - Date.now()) / 60000;
}

function getVariant(status: DoctorAppointmentRow['status']) {
  switch (status) {
    case 'Pending': return 'pending';
    case 'Confirmed': return 'confirmed';
    case 'InProgress': return 'inprogress';
    case 'Completed': return 'completed';
    case 'Cancelled': return 'cancelled';
  }
}

function getStatusLabel(status: DoctorAppointmentRow['status']) {
  switch (status) {
    case 'Pending': return '⏳ Chờ xác nhận';
    case 'Confirmed': return '✅ Đã xác nhận';
    case 'InProgress': return '🔵 Đang thực hiện';
    case 'Completed': return '✔ Hoàn thành';
    case 'Cancelled': return '✕ Đã hủy';
  }
}

function formatAppointmentType(t?: string) {
  if (!t) return '';
  const v = t.toLowerCase();
  if (v === 'at_home') return 'Tại nhà';
  if (v === 'at_store') return 'Tại cửa hàng';
  return t;
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [appointments, setAppointments] = useState<DoctorAppointmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal xác nhận đăng xuất
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ── Fetch appointments (GET /api/appointments?date= — Doctor / Admin) ── */
  const fetchAppointments = useCallback(async (date: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      navigate('/dang-nhap', { replace: true, state: { from: '/doctor' } });
      return;
    }
    try {
      setLoading(true);
      const data = await appointmentService.getDoctorAppointments(date);
      setAppointments(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
        toast.error('Không có quyền hoặc phiên đã hết hạn. Đăng nhập lại.');
        navigate('/dang-nhap', { replace: true });
        return;
      }
      toast.error(msg || 'Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  /* ── Logout handlers ── */
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    setShowLogoutConfirm(false);
    navigate('/dang-nhap');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  /* ── Appointment actions ── */
  const handleConfirm = async (id: string) => {
    try {
      setProcessingId(id);
      await appointmentService.confirmAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Confirmed' } : a))
      );
      toast.success('Đã xác nhận lịch hẹn.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xác nhận.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối lịch hẹn này?')) return;

    try {
      setProcessingId(id);
      await appointmentService.updateStatus(id, { status: 'cancelled' });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
      );
      toast.success('Đã từ chối lịch hẹn.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể từ chối.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setProcessingId(id);
      await appointmentService.completeAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Completed' } : a))
      );
      toast.success('Đã đánh dấu hoàn thành.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartInProgress = async (id: string) => {
    try {
      setProcessingId(id);
      await appointmentService.startInProgress(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'InProgress' } : a))
      );
      toast.success('Đã chuyển sang trạng thái đang thực hiện.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật.');
    } finally {
      setProcessingId(null);
    }
  };

  /* ── Filtered & Next upcoming ── */
  const filtered = useMemo(() => {
    const list = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);
    return [...list].sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filter]);

  const nextUpcoming = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          (a.status === 'Confirmed' || a.status === 'InProgress') &&
          minutesUntil(a.date, a.time) > 0
      )
      .sort((a, b) => minutesUntil(a.date, a.time) - minutesUntil(b.date, b.time))[0];
  }, [appointments]);

  const formatDateLabel = (d: string) => {
    if (d === today) return 'Hôm nay';
    return new Date(d).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      {/* Blobs */}
      <div className={styles.blobs} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
      </div>

      {/* Sticky Header */}
      <div className={styles.stickyHeader}>
        <div className={styles.stickyInner}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Quản lý lịch hẹn 🐾</h1>
            <p className={styles.pageSubtitle}>{formatDateLabel(selectedDate)}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.datePicker}>
              <CalendarDays size={15} className={styles.dateIcon} />
              <input
                type="date"
                className={styles.dateInput}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <button
              className={styles.refreshBtn}
              onClick={() => fetchAppointments(selectedDate)}
              disabled={loading}
              aria-label="Tải lại"
            >
              <RefreshCw size={15} className={loading ? styles.spinning : ''} />
            </button>

            {/* Nút Đăng xuất */}
            <button
              className={styles.logoutBtn}
              onClick={handleLogoutClick}
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className={styles.logoutText}>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Stats row */}
        <div className={styles.statsRow}>
          {[
            { label: 'Tổng cộng', count: appointments.length, color: 'all' },
            { label: 'Chờ xác nhận', count: appointments.filter((a) => a.status === 'Pending').length, color: 'pending' },
            { label: 'Đã xác nhận', count: appointments.filter((a) => a.status === 'Confirmed').length, color: 'confirmed' },
            { label: 'Đang TH', count: appointments.filter((a) => a.status === 'InProgress').length, color: 'inprogress' },
            { label: 'Hoàn thành', count: appointments.filter((a) => a.status === 'Completed').length, color: 'completed' },
          ].map((s) => (
            <div key={s.label} className={`${styles.statCard} ${styles[`stat_${s.color}`]}`}>
              <span className={styles.statCount}>{s.count}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Next upcoming highlight */}
        {nextUpcoming && (
          <div className={styles.nextCard}>
            <div className={styles.nextCardLeft}>
              <span className={styles.nextBadge}><Zap size={12} /> Sắp tới</span>
              <p className={styles.nextName}>{nextUpcoming.customerName}</p>
              <p className={styles.nextTime}>
                <Clock size={13} /> {nextUpcoming.time} —{' '}
                {(() => {
                  const mins = minutesUntil(nextUpcoming.date, nextUpcoming.time);
                  const h = Math.floor(mins / 60);
                  const m = Math.floor(mins % 60);
                  return h > 0 ? `Còn ${h}g ${m}p` : `Còn ${m} phút`;
                })()}
              </p>
            </div>
            <div className={styles.nextCardRight}>
              <p className={styles.nextReason}>{nextUpcoming.reason}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {nextUpcoming.status === 'Confirmed' && (
                  <button
                    type="button"
                    className={styles.startProgressBtn}
                    onClick={() => handleStartInProgress(nextUpcoming.id)}
                    disabled={processingId === nextUpcoming.id}
                  >
                    <PlayCircle size={14} />
                    Bắt đầu TH
                  </button>
                )}
                <button
                  type="button"
                  className={styles.completeBtn}
                  onClick={() => handleComplete(nextUpcoming.id)}
                  disabled={processingId === nextUpcoming.id}
                >
                  <CheckCircle size={14} />
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className={styles.filterCount}>
                {f.key === 'ALL' ? appointments.length : appointments.filter((a) => a.status === f.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Appointment List */}
        {loading ? (
          <div className={styles.loadingState}>
            <span className={styles.loadingPaw}>🐾</span>
            <p>Đang tải lịch hẹn...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <h3 className={styles.emptyTitle}>Không có lịch hẹn</h3>
            <p className={styles.emptyText}>Chưa có lịch hẹn nào vào ngày này.</p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {filtered.map((appt, i) => {
              const variant = getVariant(appt.status);
              const isProcessing = processingId === appt.id;
              const isNext = appt.id === nextUpcoming?.id;

              return (
                <div
                  key={appt.id}
                  className={`${styles.timelineItem} ${isNext ? styles.timelineItemNext : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={styles.timeCol}>
                    <span className={styles.timeLabel}>{appt.time}</span>
                    <div className={`${styles.timeDot} ${styles[`dot_${variant}`]}`} />
                    {i < filtered.length - 1 && <div className={styles.timeLine} />}
                  </div>

                  <div className={`${styles.apptCard} ${styles[`card_${variant}`]}`}>
                    {isNext && <div className={styles.nextGlow} aria-hidden="true" />}

                    <div className={styles.cardTop}>
                      <div className={styles.customerInfo}>
                        <div className={styles.customerAvatar}>{appt.customerName.charAt(0)}</div>
                        <div>
                          <p className={styles.customerName}>
                            {appt.customerName}
                            {isNext && <span className={styles.inlineBadge}><Zap size={10} /> Sắp tới</span>}
                          </p>
                          <p className={styles.customerMeta}>
                            <Clock size={11} /> {appt.time}
                          </p>
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[`badge_${variant}`]}`}>
                        {getStatusLabel(appt.status)}
                      </span>
                    </div>

                    {(appt.serviceName || appt.petName || appt.appointmentType || appt.branchName || appt.serviceAddress) && (
                      <p className={styles.serviceMeta}>
                        {appt.serviceName && (
                          <>
                            <strong>Dịch vụ:</strong> {appt.serviceName}
                          </>
                        )}
                        {appt.petName && (
                          <>
                            {appt.serviceName ? ' · ' : ''}
                            <strong>Thú cưng:</strong> {appt.petName}
                          </>
                        )}
                        {formatAppointmentType(appt.appointmentType) && (
                          <>
                            {' · '}
                            <strong>Hình thức:</strong> {formatAppointmentType(appt.appointmentType)}
                          </>
                        )}
                        {appt.branchName && (
                          <>
                            {' · '}
                            <strong>Chi nhánh:</strong> {appt.branchName}
                          </>
                        )}
                        {appt.serviceAddress && (
                          <>
                            <br />
                            <strong>Địa chỉ:</strong> {appt.serviceAddress}
                          </>
                        )}
                      </p>
                    )}

                    <div className={styles.reasonBox}>
                      <FileText size={12} className={styles.reasonIcon} />
                      <p className={styles.reasonText}>{appt.reason}</p>
                    </div>

                    {appt.status === 'Pending' && (
                      <div className={styles.actions}>
                        <button
                          className={styles.confirmBtn}
                          onClick={() => handleConfirm(appt.id)}
                          disabled={isProcessing}
                        >
                          <Check size={14} />
                          {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleCancel(appt.id)}
                          disabled={isProcessing}
                        >
                          <X size={14} />
                          Từ chối
                        </button>
                      </div>
                    )}

                    {appt.status === 'Confirmed' && (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.startProgressBtn}
                          onClick={() => handleStartInProgress(appt.id)}
                          disabled={isProcessing}
                        >
                          <PlayCircle size={14} />
                          {isProcessing ? 'Đang xử lý...' : 'Bắt đầu thực hiện'}
                        </button>
                        <button
                          type="button"
                          className={styles.completeApptBtn}
                          onClick={() => handleComplete(appt.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle size={14} />
                          {isProcessing ? 'Đang cập nhật...' : 'Hoàn thành'}
                        </button>
                      </div>
                    )}

                    {appt.status === 'InProgress' && (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.completeApptBtn}
                          onClick={() => handleComplete(appt.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle size={14} />
                          {isProcessing ? 'Đang cập nhật...' : 'Hoàn thành dịch vụ'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== LOGOUT CONFIRM MODAL ==================== */}
      {showLogoutConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}>🚪</div>
            <h3 className={styles.confirmTitle}>Đăng xuất</h3>
            <p className={styles.confirmText}>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý lịch hẹn?
            </p>

            <div className={styles.confirmActions}>
              <button className={styles.confirmCancelBtn} onClick={cancelLogout}>
                Hủy bỏ
              </button>
              <button className={styles.confirmLogoutBtn} onClick={confirmLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}