import { useEffect, useState } from 'react';
import { FALLBACK_TEAM, type ClinicalExpert } from '../data/team';

/**
 * Clinical team for the UI. Starts with the website mirror (so it is never empty)
 * and swaps in the live list from /api/experts (Supabase staff_profiles) once loaded.
 */
let cache: ClinicalExpert[] = FALLBACK_TEAM;
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function load() {
  if (loaded || inflight) return;
  inflight = fetch('/api/experts')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (Array.isArray(data) && data.length) cache = data as ClinicalExpert[];
      loaded = true;
      listeners.forEach((fn) => fn());
    })
    .catch(() => undefined)
    .finally(() => {
      inflight = null;
    });
}

export function useExperts(): ClinicalExpert[] {
  const [list, setList] = useState<ClinicalExpert[]>(cache);
  useEffect(() => {
    const update = () => setList(cache);
    listeners.add(update);
    load();
    if (list !== cache) update();
    return () => {
      listeners.delete(update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return list;
}

/** Best match for a service code, preferring psychologists for assessments. */
export function expertForService(list: ClinicalExpert[], code: string): ClinicalExpert | undefined {
  return list.find((e) => e.services.includes(code));
}
