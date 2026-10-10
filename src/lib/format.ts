/** Formatting + age helpers shared across screens. All copy in Bahasa Indonesia. */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const DAYS_PER_MONTH = 30.4375;

export function parseDate(value: string): Date {
  // Treat plain YYYY-MM-DD as a local date (avoid UTC shift)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function todayISO(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** Whole months of age at a given date (defaults to today). */
export function ageInMonths(birthDate: string, at: Date = new Date()): number {
  const birth = parseDate(birthDate);
  const days = Math.max(0, daysBetween(birth, at));
  return Math.floor(days / DAYS_PER_MONTH);
}

/** Decimal months of age at a given date, used to plot measurements. */
export function ageInMonthsDecimal(birthDate: string, at: string | Date): number {
  const birth = parseDate(birthDate);
  const target = typeof at === 'string' ? parseDate(at) : at;
  const days = Math.max(0, daysBetween(birth, target));
  return Math.round((days / DAYS_PER_MONTH) * 10) / 10;
}

/** Friendly age label, e.g. "1 tahun 9 bulan", "5 bulan", "12 hari". */
export function ageLabel(birthDate: string, at: Date = new Date()): string {
  const birth = parseDate(birthDate);
  const days = daysBetween(birth, at);
  if (days < 0) return 'Belum lahir';
  if (days < 31) return `${days} hari`;
  const months = Math.floor(days / DAYS_PER_MONTH);
  if (months < 24) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} tahun` : `${years} tahun ${rest} bulan`;
}

export function shortAgeLabel(months: number): string {
  if (months < 24) return `${months} bln`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} th` : `${years} th ${rest} bln`;
}

export function addMonths(dateStr: string, months: number): Date {
  const d = parseDate(dateStr);
  const result = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
  return result;
}

export function formatDate(value: string | Date, style: 'short' | 'long' | 'day' = 'short'): string {
  const d = typeof value === 'string' ? parseDate(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  if (style === 'long') {
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (style === 'day') {
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

export function timeAgo(value: string): string {
  const d = new Date(value);
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return formatDate(d);
}

export function rupiah(amount: number): string {
  return 'Rp' + Math.round(amount).toLocaleString('id-ID');
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function firstName(fullName?: string): string {
  if (!fullName) return 'Bunda';
  const first = fullName.trim().split(/\s+/)[0];
  return first || 'Bunda';
}

/** Replace em dashes (and spaced en dashes) with commas so AI or seeded copy stays dash-free. */
export function stripEmDash(text: string): string {
  return text
    .replace(/\s*\u2014\s*/g, ', ')
    .replace(/\s+\u2013\s+/g, ', ')
    .replace(/,\s*,/g, ',');
}
