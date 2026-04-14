const PREFIX = 'petcare_appt_badge_';

function readUserId(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw) as { id?: string };
    return u?.id ?? null;
  } catch {
    return null;
  }
}

export function getAppointmentBadgeCount(): number {
  const uid = readUserId();
  if (!uid) return 0;
  const v = localStorage.getItem(PREFIX + uid);
  const n = parseInt(v || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function incrementAppointmentBadgeCount(): void {
  const uid = readUserId();
  if (!uid) return;
  const next = getAppointmentBadgeCount() + 1;
  localStorage.setItem(PREFIX + uid, String(next));
  window.dispatchEvent(new Event('petcare-appointment-badge-change'));
}

export function clearAppointmentBadgeForCurrentUser(): void {
  const uid = readUserId();
  if (!uid) return;
  localStorage.removeItem(PREFIX + uid);
  window.dispatchEvent(new Event('petcare-appointment-badge-change'));
}
