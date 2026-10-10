import type { Child } from '../types';
import { PREGNANCY_WEEKS, type PregnancyWeek } from '../data/pregnancy';
import { daysBetween, parseDate, toISODate } from './format';

/**
 * Pregnancy dating (Naegele): HPL = HPHT + 280 days. Gestational age counts from HPHT.
 * When only the HPL is known, HPHT is derived as HPL - 280 days.
 */

export function hplFromHpht(hpht: string): string {
  const d = parseDate(hpht);
  d.setDate(d.getDate() + 280);
  return toISODate(d);
}

export function hphtFromHpl(hpl: string): string {
  const d = parseDate(hpl);
  d.setDate(d.getDate() - 280);
  return toISODate(d);
}

export interface PregnancyStatus {
  hpl: string;
  hpht: string;
  /** Days since HPHT */
  totalDays: number;
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  daysToHpl: number;
  /** Content for the current week (clamped to 4 to 40) */
  week: PregnancyWeek;
  /** 0 to 1 progress through 40 weeks */
  progress: number;
}

export function pregnancyStatus(child: Child, now: Date = new Date()): PregnancyStatus {
  const hpl = child.expectedDueDate || child.birthDate;
  const hpht = child.lmpDate || hphtFromHpl(hpl);
  const totalDays = Math.max(0, daysBetween(parseDate(hpht), now));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  // Buku KIA: trimester 1 up to 12 weeks, 2 up to 24 weeks, 3 after
  const trimester = weeks <= 12 ? 1 : weeks <= 24 ? 2 : 3;
  const daysToHpl = daysBetween(now, parseDate(hpl));
  const clamped = Math.min(40, Math.max(4, weeks));
  const week = PREGNANCY_WEEKS.find((w) => w.week === clamped) ?? PREGNANCY_WEEKS[0];
  return { hpl, hpht, totalDays, weeks, days, trimester, daysToHpl, week, progress: Math.min(1, totalDays / 280) };
}

export function gestationLabel(s: Pick<PregnancyStatus, 'weeks' | 'days'>): string {
  return s.days ? `${s.weeks} minggu ${s.days} hari` : `${s.weeks} minggu`;
}

export function countdownLabel(daysToHpl: number): string {
  if (daysToHpl > 1) return `${daysToHpl} hari lagi menuju HPL`;
  if (daysToHpl === 1) return 'HPL besok';
  if (daysToHpl === 0) return 'Hari ini HPL';
  return `${Math.abs(daysToHpl)} hari melewati HPL`;
}

/** Kick counting starts at 28 weeks */
export const KICK_START_WEEK = 28;
/** Show the "baby is born" call to action from 37 weeks */
export const BORN_CTA_WEEK = 37;

export function profileAgeLabel(child: Child, ageLabel: (birth: string) => string): string {
  if (!child.isUnborn) return ageLabel(child.birthDate);
  const s = pregnancyStatus(child);
  return `Hamil ${gestationLabel(s)}`;
}
