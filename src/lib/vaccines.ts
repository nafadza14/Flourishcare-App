import { ChildImmunization, ImmunizationReference } from '../types';
import { IMMUNIZATIONS_SEED } from '../data/seedData';
import { addMonths, daysBetween } from './format';

export type VaccineState = 'done' | 'catchup' | 'due' | 'upcoming';

export interface VaccineItem {
  ref: ImmunizationReference;
  record?: ChildImmunization;
  dueDate: Date;
  state: VaccineState;
  daysUntil: number;
}

export const VACCINE_STATE_LABEL: Record<VaccineState, string> = {
  done: 'Selesai',
  catchup: 'Perlu dikejar',
  due: 'Waktunya',
  upcoming: 'Akan datang',
};

export function buildVaccineSchedule(birthDate: string, records: ChildImmunization[], now: Date = new Date()): VaccineItem[] {
  return IMMUNIZATIONS_SEED.map((ref) => {
    const record = records.find((r) => r.immunizationId === ref.id && r.givenDate);
    const dueDate = addMonths(birthDate, ref.recommendedAgeMonth);
    const daysUntil = daysBetween(now, dueDate);
    let state: VaccineState;
    if (record) state = 'done';
    else if (daysUntil < -30) state = 'catchup';
    else if (daysUntil <= 30) state = 'due';
    else state = 'upcoming';
    return { ref, record, dueDate, state, daysUntil };
  });
}

/** The single most relevant vaccine to show on the dashboard. */
export function nextVaccine(schedule: VaccineItem[]): VaccineItem | null {
  const pending = schedule.filter((v) => v.state !== 'done');
  if (!pending.length) return null;
  const due = pending.filter((v) => v.state === 'due').sort((a, b) => a.daysUntil - b.daysUntil);
  if (due.length) return due[0];
  const catchup = pending.filter((v) => v.state === 'catchup').sort((a, b) => a.daysUntil - b.daysUntil);
  if (catchup.length) return catchup[0]; // most overdue first
  return pending.sort((a, b) => a.daysUntil - b.daysUntil)[0];
}

export function vaccineTiming(item: VaccineItem): string {
  if (item.state === 'done') return 'Sudah diberikan';
  const d = item.daysUntil;
  if (d === 0) return 'Hari ini';
  if (d > 0 && d <= 30) return d === 1 ? 'Besok' : `Dalam ${d} hari`;
  if (d > 30) {
    const months = Math.round(d / 30);
    return `Dalam ${months} bulan`;
  }
  const late = Math.abs(d);
  if (late <= 30) return `Lewat ${late} hari`;
  return `Lewat ${Math.round(late / 30)} bulan`;
}

export function ageLabelForVaccine(month: number): string {
  if (month === 0) return 'Saat lahir';
  return `Usia ${month} bulan`;
}
