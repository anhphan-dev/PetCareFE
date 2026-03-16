type RevokedTokenEntry = {
  hash: string;
  expiresAt: number;
};

const REVOKED_TOKENS_KEY = 'revokedTokens';
const FALLBACK_TTL_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 200;

function hashToken(token: string): string {
  let hash = 5381;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 33) ^ token.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function readEntries(): RevokedTokenEntry[] {
  try {
    const raw = localStorage.getItem(REVOKED_TOKENS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RevokedTokenEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.hash === 'string' &&
        typeof entry.expiresAt === 'number' &&
        Number.isFinite(entry.expiresAt)
    );
  } catch {
    return [];
  }
}

function writeEntries(entries: RevokedTokenEntry[]): void {
  localStorage.setItem(REVOKED_TOKENS_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

function pruneEntries(entries: RevokedTokenEntry[]): RevokedTokenEntry[] {
  const now = Date.now();
  return entries.filter((entry) => entry.expiresAt > now);
}

function parseExpiry(expiresAt?: string | null): number {
  if (!expiresAt) return Date.now() + FALLBACK_TTL_MS;
  const timestamp = Date.parse(expiresAt);
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) return Date.now() + FALLBACK_TTL_MS;
  return timestamp;
}

export function revokeToken(token: string, expiresAt?: string | null): void {
  if (!token) return;

  const tokenHash = hashToken(token);
  const validEntries = pruneEntries(readEntries()).filter((entry) => entry.hash !== tokenHash);

  validEntries.unshift({
    hash: tokenHash,
    expiresAt: parseExpiry(expiresAt),
  });

  writeEntries(validEntries);
}

export function isTokenRevoked(token: string): boolean {
  if (!token) return false;

  const entries = readEntries();
  const validEntries = pruneEntries(entries);
  if (validEntries.length !== entries.length) {
    writeEntries(validEntries);
  }

  const tokenHash = hashToken(token);
  return validEntries.some((entry) => entry.hash === tokenHash);
}

export function clearTokenRevocation(token: string): void {
  if (!token) return;

  const tokenHash = hashToken(token);
  const validEntries = pruneEntries(readEntries()).filter((entry) => entry.hash !== tokenHash);
  writeEntries(validEntries);
}
