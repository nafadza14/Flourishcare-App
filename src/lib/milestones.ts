import type { Child, ChildMilestone, MilestoneDomain } from '../types';
import { CDC_CHECKPOINTS, type CdcCheckpoint, type CdcMilestone } from '../data/milestonesCdc';
import { ageInMonths } from './format';
import { prematureWeeks } from './growth';

/**
 * Milestone checklist based on CDC "Learn the Signs. Act Early." (2022): each checkpoint lists
 * what most children (75% or more) can do by that age, so a missed item is a reason to talk to
 * a professional, not a diagnosis.
 */

export type { CdcMilestone, CdcCheckpoint };
export const CHECKPOINTS = CDC_CHECKPOINTS;

export const DOMAINS: { key: MilestoneDomain; label: string; short: string }[] = [
  { key: 'motorik_kasar', label: 'Motorik kasar', short: 'Kasar' },
  { key: 'motorik_halus', label: 'Motorik halus', short: 'Halus' },
  { key: 'bahasa', label: 'Bicara dan bahasa', short: 'Bahasa' },
  { key: 'sosial_emosional', label: 'Sosial emosional', short: 'Sosial' },
];

export function domainLabel(domain: MilestoneDomain): string {
  return DOMAINS.find((d) => d.key === domain)?.label ?? domain;
}

export function checkpointShortLabel(age: number): string {
  if (age < 24) return `${age} bln`;
  const years = age / 12;
  return `${Number.isInteger(years) ? years : years.toLocaleString('id-ID', { maximumFractionDigits: 1 })} th`;
}

/** Developmental age in whole months: corrected for prematurity until 2 years */
export function devAgeMonths(child: Child, at: Date = new Date()): number {
  const chrono = ageInMonths(child.birthDate, at);
  const weeks = prematureWeeks(child);
  if (weeks && chrono < 24) return Math.max(0, Math.floor(chrono - ((40 - weeks) * 7) / 30.4375));
  return chrono;
}

/** The checkpoint the child has most recently reached (the first one for babies under 2 months) */
export function checkpointForAge(ageMonths: number): CdcCheckpoint {
  let current = CHECKPOINTS[0];
  for (const c of CHECKPOINTS) if (c.ageMonths <= ageMonths) current = c;
  return current;
}

export function nextCheckpoint(ageMonths: number): CdcCheckpoint | null {
  return CHECKPOINTS.find((c) => c.ageMonths > ageMonths) ?? null;
}

export function isAchieved(list: ChildMilestone[], milestoneId: string): boolean {
  return list.some((m) => m.milestoneId === milestoneId && m.achieved);
}

export function progressAt(list: ChildMilestone[], checkpoint: CdcCheckpoint) {
  const done = checkpoint.items.filter((m) => isAchieved(list, m.id)).length;
  const total = checkpoint.items.length;
  return { done, total, ratio: total ? done / total : 0 };
}

/** Unchecked milestones from checkpoints the child has already passed */
/**
 * Unchecked items from the checkpoint just before the current one.
 * Only one step back: a skill missing two stages ago also shows up as missing in the stage after it,
 * and listing every older stage would overwhelm a parent who simply started recording late.
 */
export function lateMilestones(list: ChildMilestone[], ageMonths: number): (CdcMilestone & { ageMonths: number })[] {
  const current = checkpointForAge(ageMonths);
  const prev = [...CHECKPOINTS].reverse().find((c) => c.ageMonths < current.ageMonths);
  if (!prev) return [];
  return prev.items.filter((m) => !isAchieved(list, m.id)).map((m) => ({ ...m, ageMonths: prev.ageMonths }));
}

/** Progress per domain across every checkpoint up to the current one */
export function domainProgress(list: ChildMilestone[], ageMonths: number) {
  const current = checkpointForAge(ageMonths);
  const relevant = CHECKPOINTS.filter((c) => c.ageMonths <= current.ageMonths).flatMap((c) => c.items);
  return DOMAINS.map((d) => {
    const items = relevant.filter((m) => m.domain === d.key);
    const done = items.filter((m) => isAchieved(list, m.id)).length;
    return { ...d, done, total: items.length, ratio: items.length ? done / items.length : 0 };
  });
}

export function findMilestone(id: string): (CdcMilestone & { ageMonths: number }) | null {
  for (const c of CHECKPOINTS) {
    const m = c.items.find((x) => x.id === id);
    if (m) return { ...m, ageMonths: c.ageMonths };
  }
  return null;
}
