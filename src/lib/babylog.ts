import { useCallback, useEffect, useRef, useState } from 'react';
import type { BabyLog, BabyLogKind } from '../types';
import { getJSON, sendJSON } from '../api';
import { apiFetch } from '../api';
import { emitDataChanged, useDataChanged } from './events';

export const FEED_DETAILS: { key: string; label: string; timer: boolean }[] = [
  { key: 'breast_left', label: 'ASI kiri', timer: true },
  { key: 'breast_right', label: 'ASI kanan', timer: true },
  { key: 'bottle_asi', label: 'Botol ASIP', timer: false },
  { key: 'bottle_formula', label: 'Susu formula', timer: false },
  { key: 'solid', label: 'MPASI', timer: false },
];

export const DIAPER_DETAILS = [
  { key: 'wet', label: 'Pipis' },
  { key: 'dirty', label: 'Pup' },
  { key: 'both', label: 'Pipis dan pup' },
];

export function detailLabel(log: Pick<BabyLog, 'kind' | 'detail'>): string {
  if (log.kind === 'feed') return FEED_DETAILS.find((d) => d.key === log.detail)?.label ?? 'Menyusu';
  if (log.kind === 'diaper') return DIAPER_DETAILS.find((d) => d.key === log.detail)?.label ?? 'Popok';
  if (log.kind === 'sleep') return 'Tidur';
  if (log.kind === 'pump') return 'Pompa ASI';
  return 'Gerakan janin';
}

export function useBabyLogs(childId: string | undefined, enabled = true) {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const req = useRef(0);
  const load = useCallback(async () => {
    if (!childId || !enabled) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const id = ++req.current;
    const list = await getJSON<BabyLog[]>(`/api/baby-logs/${childId}?days=7`, []);
    if (id === req.current) {
      setLogs(list);
      setLoading(false);
    }
  }, [childId, enabled]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  useDataChanged((scope) => scope === 'babylog' && load(), [load]);
  return { logs, loading, reload: load, setLogs };
}

export async function addLog(childId: string, log: { kind: BabyLogKind; detail?: string; startedAt?: string; endedAt?: string | null; amountMl?: number | null; count?: number | null; note?: string }) {
  const saved = await sendJSON<BabyLog>('/api/baby-logs', { childId, startedAt: new Date().toISOString(), ...log });
  emitDataChanged('babylog');
  return saved;
}

export async function updateLog(childId: string, id: string, patch: Partial<BabyLog>) {
  const saved = await sendJSON<BabyLog>(`/api/baby-logs/${id}`, { childId, ...patch }, 'PUT');
  emitDataChanged('babylog');
  return saved;
}

export async function deleteLog(childId: string, id: string) {
  const res = await apiFetch(`/api/baby-logs/${id}?childId=${encodeURIComponent(childId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus.');
  emitDataChanged('babylog');
}

/* ---------------- Summaries ---------------- */

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function minutesBetween(a: string, b?: string | null, now = new Date()) {
  const end = b ? new Date(b) : now;
  return Math.max(0, Math.round((end.getTime() - new Date(a).getTime()) / 60000));
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} j ${m} mnt` : `${h} jam`;
}

export interface DaySummary {
  feeds: number;
  feedMl: number;
  lastFeed: BabyLog | null;
  nextSide: 'kiri' | 'kanan' | null;
  sleepMinutes: number;
  wet: number;
  dirty: number;
  runningFeed: BabyLog | null;
  runningSleep: BabyLog | null;
  lastSleepEnd: string | null;
}

/** Totals for today (sleep counted only for the part that falls on today) */
export function summarize(logs: BabyLog[], now = new Date()): DaySummary {
  const dayStart = startOfDay(now).getTime();
  const today = logs.filter((l) => new Date(l.startedAt).getTime() >= dayStart || (l.endedAt ? new Date(l.endedAt).getTime() >= dayStart : true));
  const feeds = today.filter((l) => l.kind === 'feed' && new Date(l.startedAt).getTime() >= dayStart);
  const sorted = logs.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const lastFeed = sorted.find((l) => l.kind === 'feed') ?? null;
  const lastBreast = sorted.find((l) => l.kind === 'feed' && l.detail?.startsWith('breast_'));
  const nextSide = lastBreast ? (lastBreast.detail === 'breast_left' ? 'kanan' : 'kiri') : null;
  let sleepMinutes = 0;
  for (const l of today.filter((x) => x.kind === 'sleep')) {
    const start = Math.max(new Date(l.startedAt).getTime(), dayStart);
    const end = l.endedAt ? new Date(l.endedAt).getTime() : now.getTime();
    if (end > start) sleepMinutes += Math.round((end - start) / 60000);
  }
  const diapers = today.filter((l) => l.kind === 'diaper' && new Date(l.startedAt).getTime() >= dayStart);
  const lastSleep = sorted.find((l) => l.kind === 'sleep' && l.endedAt);
  return {
    feeds: feeds.length,
    feedMl: feeds.reduce((sum, l) => sum + (l.amountMl || 0), 0),
    lastFeed,
    nextSide,
    sleepMinutes,
    wet: diapers.filter((d) => d.detail === 'wet' || d.detail === 'both').length,
    dirty: diapers.filter((d) => d.detail === 'dirty' || d.detail === 'both').length,
    runningFeed: logs.find((l) => l.kind === 'feed' && !l.endedAt) ?? null,
    runningSleep: logs.find((l) => l.kind === 'sleep' && !l.endedAt) ?? null,
    lastSleepEnd: lastSleep?.endedAt ?? null,
  };
}

/** Shown on Pantau and Beranda for babies under 2 years */
export const TRACKER_MAX_MONTHS = 24;
