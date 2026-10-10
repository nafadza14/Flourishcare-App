import { ChildMilestone, MilestoneDomain, MilestoneReference } from '../types';
import { MILESTONES_SEED } from '../data/seedData';

export interface AgeRange {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const AGE_RANGES: AgeRange[] = [
  { key: '03', label: '0-3 bln', min: 0, max: 3 },
  { key: '46', label: '4-6 bln', min: 4, max: 6 },
  { key: '79', label: '7-9 bln', min: 7, max: 9 },
  { key: '1012', label: '10-12 bln', min: 10, max: 12 },
  { key: '1318', label: '13-18 bln', min: 13, max: 18 },
  { key: '1924', label: '19-24 bln', min: 19, max: 24 },
  { key: '2436', label: '2-3 th', min: 25, max: 36 },
  { key: '3660', label: '3-5 th', min: 37, max: 60 },
  { key: '6084', label: '5-7 th', min: 61, max: 84 },
];

export const DOMAINS: { key: MilestoneDomain; label: string; short: string }[] = [
  { key: 'motorik_kasar', label: 'Motorik kasar', short: 'Kasar' },
  { key: 'motorik_halus', label: 'Motorik halus', short: 'Halus' },
  { key: 'bahasa', label: 'Bicara dan bahasa', short: 'Bahasa' },
  { key: 'sosial_emosional', label: 'Sosial emosional', short: 'Sosial' },
];

export function domainLabel(domain: MilestoneDomain): string {
  return DOMAINS.find((d) => d.key === domain)?.label ?? domain;
}

export function rangeForAge(ageMonths: number): AgeRange {
  return AGE_RANGES.find((r) => ageMonths <= r.max) ?? AGE_RANGES[AGE_RANGES.length - 1];
}

export function milestonesInRange(range: AgeRange): MilestoneReference[] {
  return MILESTONES_SEED.filter((m) => m.ageMonthMin === range.min && m.ageMonthMax === range.max);
}

export function isAchieved(list: ChildMilestone[], milestoneId: string): boolean {
  return list.some((m) => m.milestoneId === milestoneId && m.achieved);
}

/** Milestones from age ranges the child has fully passed that are still unchecked. */
export function lateMilestones(list: ChildMilestone[], ageMonths: number): MilestoneReference[] {
  return MILESTONES_SEED.filter((m) => m.ageMonthMax < ageMonths && !isAchieved(list, m.id));
}

export function rangeProgress(list: ChildMilestone[], range: AgeRange) {
  const items = milestonesInRange(range);
  const done = items.filter((m) => isAchieved(list, m.id)).length;
  return { done, total: items.length, ratio: items.length ? done / items.length : 0 };
}

/** Progress per domain across every range up to the child's current one. */
export function domainProgress(list: ChildMilestone[], ageMonths: number) {
  const current = rangeForAge(ageMonths);
  const relevant = MILESTONES_SEED.filter((m) => m.ageMonthMin <= current.max);
  return DOMAINS.map((d) => {
    const items = relevant.filter((m) => m.domain === d.key);
    const done = items.filter((m) => isAchieved(list, m.id)).length;
    return { ...d, done, total: items.length, ratio: items.length ? done / items.length : 0 };
  });
}

export function overallProgress(list: ChildMilestone[], ageMonths: number) {
  const current = rangeForAge(ageMonths);
  const relevant = MILESTONES_SEED.filter((m) => m.ageMonthMin <= current.max);
  const done = relevant.filter((m) => isAchieved(list, m.id)).length;
  return { done, total: relevant.length, ratio: relevant.length ? done / relevant.length : 0 };
}
