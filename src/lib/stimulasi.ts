import type { Activity } from '../types';
import { ACTIVITIES_SEED } from '../data/seedData';
import { todayISO, toISODate } from './format';

export function activitiesForAge(ageMonths: number): Activity[] {
  const exact = ACTIVITIES_SEED.filter((a) => ageMonths >= a.ageMonthMin && ageMonths <= a.ageMonthMax);
  if (exact.length) return exact;
  // Fall back to the nearest age band so the list is never empty
  const sorted = ACTIVITIES_SEED.slice().sort(
    (a, b) => Math.abs((a.ageMonthMin + a.ageMonthMax) / 2 - ageMonths) - Math.abs((b.ageMonthMin + b.ageMonthMax) / 2 - ageMonths),
  );
  return sorted.slice(0, 3);
}

const dayKey = (childId: string, date = todayISO()) => `fc_stim_${childId}_${date}`;
const historyKey = (childId: string) => `fc_stim_days_${childId}`;

export function getCompleted(childId: string): string[] {
  try {
    const raw = localStorage.getItem(dayKey(childId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function setCompleted(childId: string, ids: string[]) {
  try {
    localStorage.setItem(dayKey(childId), JSON.stringify(ids));
    const days = getActiveDays(childId);
    const today = todayISO();
    const next = ids.length ? Array.from(new Set([...days, today])) : days.filter((d) => d !== today);
    localStorage.setItem(historyKey(childId), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getActiveDays(childId: string): string[] {
  try {
    const raw = localStorage.getItem(historyKey(childId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Consecutive days with at least one completed activity, ending today or yesterday. */
export function getStreak(childId: string): number {
  const days = new Set(getActiveDays(childId));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
