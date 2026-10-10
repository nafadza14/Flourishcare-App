import { useCallback, useEffect, useRef, useState } from 'react';
import type { Booking, ChildImmunization, ChildMilestone, GrowthRecord, Question, Screening } from '../types';
import { getJSON } from '../api';
import { useDataChanged, type DataScope } from './events';
import { sortRecords } from './growth';

export interface ChildData {
  growth: GrowthRecord[];
  milestones: ChildMilestone[];
  immunizations: ChildImmunization[];
  screenings: Screening[];
  bookings: Booking[];
  questions: Question[];
}

const EMPTY: ChildData = { growth: [], milestones: [], immunizations: [], screenings: [], bookings: [], questions: [] };

/** Loads everything the dashboard and profile need for one child, and refreshes on changes. */
export function useChildData(childId: string | undefined, enabled = true) {
  const [data, setData] = useState<ChildData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  const load = useCallback(async () => {
    if (!childId || !enabled) {
      setData(EMPTY);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    const [growth, milestones, immunizations, screenings, bookings, questions] = await Promise.all([
      getJSON<GrowthRecord[]>(`/api/growth/${childId}`, []),
      getJSON<ChildMilestone[]>(`/api/milestones/${childId}`, []),
      getJSON<ChildImmunization[]>(`/api/immunization/${childId}`, []),
      getJSON<Screening[]>(`/api/screenings/${childId}`, []),
      getJSON<Booking[]>('/api/bookings', []),
      getJSON<Question[]>('/api/questions', []),
    ]);
    if (id !== reqId.current) return;
    setData({
      growth: sortRecords(growth),
      milestones,
      immunizations,
      screenings: screenings.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      bookings,
      questions,
    });
    setLoading(false);
  }, [childId, enabled]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useDataChanged(
    (scope: DataScope) => {
      if (scope !== 'profile') load();
    },
    [load],
  );

  return { data, loading, reload: load };
}
